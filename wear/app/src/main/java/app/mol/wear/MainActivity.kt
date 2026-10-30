package app.mol.wear

import android.content.Context
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.focusable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.input.rotary.onRotaryScrollEvent

class MainActivity : ComponentActivity() {
    private val vm: WorkoutViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON) // hands busy, screen must stay on
        val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        setContent {
            val w by vm.state.collectAsState()
            val focus = FocusRequester()
            LaunchedEffect(Unit) { focus.requestFocus() }
            LaunchedEffect(Unit) {
                vm.restOver.collect { vibrator.vibrate(VibrationEffect.createWaveform(longArrayOf(0, 200, 100, 200), -1)) }
            }
            MolTheme {
                Box(
                    Modifier.fillMaxSize().background(MolBg)
                        // crown/bezel adjusts the load
                        .onRotaryScrollEvent { e -> vm.update { it.adjustLoad(if (e.verticalScrollPixels > 0) 1 else -1) }; true }
                        .focusRequester(focus).focusable(),
                ) {
                    MolApp(w, { d -> vm.update { it.adjustLoad(d) } }, { d -> vm.update { it.adjustReps(d) } }, vm::logSet, vm::skipRest)
                }
            }
        }
    }
}
