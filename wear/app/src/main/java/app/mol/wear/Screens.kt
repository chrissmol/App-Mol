package app.mol.wear

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.ButtonDefaults
import androidx.wear.compose.material.CompactButton
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text

private fun Float.fmt() = if (this % 1f == 0f) toInt().toString() else toString()
private fun Int.clock() = "%d:%02d".format(this / 60, this % 60)

/** Stateless root: picks the screen from the state. Easy to preview at any screen size. */
@Composable
fun MolApp(w: Workout, onLoad: (Int) -> Unit, onReps: (Int) -> Unit, onLog: () -> Unit, onSkip: () -> Unit) {
    val s = LocalWatchSize.current
    // scrollable column: on small or square screens the content may exceed the height
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column(
            Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = s.edge, vertical = s.edge),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            when {
                w.done -> DoneBody(w)
                w.resting -> RestBody(w, onSkip)
                else -> SetBody(w, onLoad, onReps, onLog)
            }
        }
    }
}

@Composable
private fun SetBody(w: Workout, onLoad: (Int) -> Unit, onReps: (Int) -> Unit, onLog: () -> Unit) {
    val s = LocalWatchSize.current
    val ex = w.current!!
    Text(ex.name, maxLines = if (s.minSide < 200.dp) 1 else 2, overflow = TextOverflow.Ellipsis, textAlign = TextAlign.Center,
        fontWeight = FontWeight.Bold, fontSize = (15 * s.scale).sp, color = MaterialTheme.colors.primary)
    Text("Série ${w.setIdx + 1}/${ex.sets}", fontSize = (12 * s.scale).sp, color = Color(0xFF8B9A91))
    Stepper("${w.load.fmt()} kg", { onLoad(-1) }, { onLoad(1) })
    Stepper("${w.reps} reps", { onReps(-1) }, { onReps(1) })
    Button(onClick = onLog, modifier = Modifier.padding(top = s.dp(4)).size(s.dp(40))) {
        Text("OK", fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun Stepper(label: String, minus: () -> Unit, plus: () -> Unit) {
    val s = LocalWatchSize.current
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(s.dp(6))) {
        CompactButton(minus, Modifier.size(s.dp(30)), colors = ButtonDefaults.secondaryButtonColors()) { Text("−") }
        Text(label, fontSize = (17 * s.scale).sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = s.dp(2)))
        CompactButton(plus, Modifier.size(s.dp(30)), colors = ButtonDefaults.secondaryButtonColors()) { Text("+") }
    }
}

@Composable
private fun RestBody(w: Workout, onSkip: () -> Unit) {
    val s = LocalWatchSize.current
    Text("Descanso", fontSize = (13 * s.scale).sp, color = Color(0xFF8B9A91))
    Text(w.restLeft.clock(), fontSize = (40 * s.scale).sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colors.primary)
    Text("Próx.: ${w.current!!.name}", fontSize = (12 * s.scale).sp, maxLines = 2, overflow = TextOverflow.Ellipsis, textAlign = TextAlign.Center)
    CompactButton(onSkip, Modifier.padding(top = s.dp(6)).size(width = s.dp(64), height = s.dp(34))) { Text("Pular", fontSize = (11 * s.scale).sp) }
}

@Composable
private fun DoneBody(w: Workout) {
    val s = LocalWatchSize.current
    Text("Treino feito", fontSize = (18 * s.scale).sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colors.primary)
    Text("${w.log.size} séries", fontSize = (14 * s.scale).sp)
    Text("${w.log.sumOf { (it.reps * it.load).toDouble() }.toInt()} kg de volume", fontSize = (12 * s.scale).sp, color = Color(0xFF8B9A91), textAlign = TextAlign.Center)
}
