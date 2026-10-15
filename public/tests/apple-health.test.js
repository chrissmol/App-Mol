import { deflateRawSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { newDailyWeights, parseHealthDate, readHealthWeights, weightFromLine } from '../js/modules/apple-health.js';

const XML = `<?xml version="1.0" encoding="UTF-8"?>
<HealthData locale="pt_BR">
 <Record type="HKQuantityTypeIdentifierBodyMass" sourceName="Balança" unit="kg" creationDate="2026-10-01 07:31:00 -0300" startDate="2026-10-01 07:30:00 -0300" endDate="2026-10-01 07:30:00 -0300" value="80.4"/>
 <Record type="HKQuantityTypeIdentifierBodyMass" sourceName="Balança" unit="kg" creationDate="2026-10-01 20:01:00 -0300" startDate="2026-10-01 20:00:00 -0300" endDate="2026-10-01 20:00:00 -0300" value="81.2">
  <MetadataEntry key="HKWasUserEntered" value="1"/>
 </Record>
 <Record type="HKQuantityTypeIdentifierBodyMass" sourceName="Saúde" unit="lb" creationDate="2026-10-03 08:00:00 -0300" startDate="2026-10-03 08:00:00 -0300" endDate="2026-10-03 08:00:00 -0300" value="176"/>
 <Record type="HKQuantityTypeIdentifierStepCount" sourceName="iPhone" unit="count" creationDate="2026-10-03 08:00:00 -0300" startDate="2026-10-03 08:00:00 -0300" endDate="2026-10-03 09:00:00 -0300" value="900"/>
</HealthData>
`;

// Zip mínimo com um arquivo comprimido (deflate), como o que o app Saúde gera.
function zipWith(name, text) {
  const nameBytes = Buffer.from(name);
  const data = deflateRawSync(Buffer.from(text));
  const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(8, 8);
  local.writeUInt32LE(data.length, 18); local.writeUInt16LE(nameBytes.length, 26);
  const central = Buffer.alloc(46); central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(8, 10);
  central.writeUInt32LE(data.length, 20); central.writeUInt16LE(nameBytes.length, 28);
  const dirOffset = 30 + nameBytes.length + data.length;
  const end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(1, 8); end.writeUInt16LE(1, 10);
  end.writeUInt32LE(46 + nameBytes.length, 12); end.writeUInt32LE(dirOffset, 16);
  return new File([local, nameBytes, data, central, nameBytes, end], 'exportar.zip');
}

describe('importação do Apple Saúde', () => {
  it('converte a data do Saúde com fuso', () => {
    expect(parseHealthDate('2026-10-01 07:30:00 -0300').toISOString()).toBe('2026-10-01T10:30:00.000Z');
    expect(parseHealthDate('ontem')).toBeNull();
  });

  it('lê só registros de peso, convertendo libras', () => {
    const [kg, , , , lb, steps] = XML.split('\n').slice(2).map(weightFromLine);
    expect(kg.pesoKg).toBe(80.4);
    expect(lb.pesoKg).toBe(79.8);
    expect(steps).toBeNull();
  });

  it('lê o export.xml de dentro do .zip', async () => {
    const weights = await readHealthWeights(zipWith('apple_health_export/export.xml', XML));
    expect(weights.map(item => item.pesoKg)).toEqual([80.4, 81.2, 79.8]);
  });

  it('aceita o export.xml solto', async () => {
    expect(await readHealthWeights(new File([XML], 'export.xml'))).toHaveLength(3);
  });

  it('guarda um peso por dia e pula dias que já têm peso', async () => {
    const weights = await readHealthWeights(new File([XML], 'export.xml'));
    expect(newDailyWeights(weights).map(item => item.pesoKg)).toEqual([81.2, 79.8]);
    expect(newDailyWeights(weights, [new Date('2026-10-03T12:00:00-03:00')]).map(item => item.pesoKg)).toEqual([81.2]);
  });
});
