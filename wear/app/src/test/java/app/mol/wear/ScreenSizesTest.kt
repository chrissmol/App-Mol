package app.mol.wear

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import app.cash.paparazzi.DeviceConfig
import app.cash.paparazzi.Paparazzi
import com.android.resources.ScreenRound
import org.junit.Rule
import org.junit.Test

private val plan = Workout("t", listOf(Exercise("Agachamento Búlgaro com Elevação do Pé Dianteiro", 3, 10, 40f), Exercise("Remada", 3, 10, 35f)))
private val finished = Workout("t", listOf(Exercise("A", 1, 10, 40f))).logSet()

/** Renders every screen on several watch shapes/sizes; PNGs land in app/src/test/snapshots. */
abstract class ScreenSizes(config: DeviceConfig) {
    @get:Rule val paparazzi = Paparazzi(deviceConfig = config)

    @Test fun screens() {
        for ((name, state) in listOf("serie" to plan, "descanso" to plan.logSet(), "fim" to finished)) {
            paparazzi.snapshot(name) {
                MolTheme { Box(Modifier.fillMaxSize().background(MolBg)) { MolApp(state, {}, {}, {}, {}) } }
            }
        }
    }
}

class SmallRound : ScreenSizes(DeviceConfig.WEAR_OS_SMALL_ROUND)
class LargeRound : ScreenSizes(DeviceConfig.WEAR_OS_SMALL_ROUND.copy(screenWidth = 454, screenHeight = 454))
class Square : ScreenSizes(DeviceConfig.WEAR_OS_SQUARE)
class Rect : ScreenSizes(DeviceConfig.WEAR_OS_SQUARE.copy(screenWidth = 320, screenHeight = 400, screenRound = ScreenRound.NOTROUND))
// 1.2" round, the smallest common case
class TinyRound : ScreenSizes(DeviceConfig.WEAR_OS_SMALL_ROUND.copy(screenWidth = 320, screenHeight = 320, screenRound = ScreenRound.ROUND))
