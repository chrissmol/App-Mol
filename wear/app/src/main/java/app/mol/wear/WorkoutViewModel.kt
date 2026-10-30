package app.mol.wear

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class WorkoutViewModel(app: Application) : AndroidViewModel(app) {
    private val _state = MutableStateFlow(
        // shortcut: bundled demo plan, replace with the plan synced from the phone app (Data Layer)
        Workout.parse(app.assets.open("treino-demo.json").bufferedReader().use { it.readText() })
    )
    val state = _state.asStateFlow()
    /** Emits when a rest period ends, so the UI can vibrate. */
    val restOver = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    private var timer: Job? = null

    fun update(f: (Workout) -> Workout) = _state.update(f)

    fun logSet() {
        _state.value = _state.value.logSet()
        timer?.cancel()
        if (_state.value.resting) timer = viewModelScope.launch {
            while (_state.value.resting) {
                delay(1000)
                _state.value = _state.value.tick()
            }
            restOver.tryEmit(Unit)
        }
    }

    fun skipRest() {
        timer?.cancel()
        _state.value = _state.value.skipRest()
    }
}

private inline fun <T> MutableStateFlow<T>.update(f: (T) -> T) { value = f(value) }
