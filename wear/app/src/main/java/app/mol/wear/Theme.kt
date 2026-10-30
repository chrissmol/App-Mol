package app.mol.wear

import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.Colors
import androidx.wear.compose.material.MaterialTheme

val MolGreen = Color(0xFF57D493)
val MolDeep = Color(0xFF1E7349)
val MolBg = Color(0xFF070A08)

/**
 * Sizes derive from the smaller screen side, so one layout fits small/large and round/square
 * watches. 1.0 is a 192dp screen (common mid-size round watch).
 */
class WatchSize(val minSide: Dp, val round: Boolean) {
    val scale = (minSide.value / 192f).coerceIn(0.8f, 1.5f)
    fun dp(v: Int) = (v * scale).dp
    /** Round screens clip the corners; keep content inside the inscribed area (~14% inset). */
    val edge: Dp get() = if (round) minSide * 0.12f else 8.dp
}

val LocalWatchSize = staticCompositionLocalOf { WatchSize(192.dp, true) }

@Composable
fun MolTheme(content: @Composable () -> Unit) {
    val c = LocalConfiguration.current
    val size = WatchSize(minOf(c.screenWidthDp, c.screenHeightDp).dp, c.isScreenRound)
    CompositionLocalProvider(LocalWatchSize provides size) {
        MaterialTheme(
            colors = Colors(primary = MolGreen, primaryVariant = MolDeep, secondary = MolGreen, background = MolBg,
                surface = Color(0xFF14201A), onPrimary = MolBg, onSecondary = MolBg,
                onBackground = Color.White, onSurface = Color.White),
            content = content,
        )
    }
}
