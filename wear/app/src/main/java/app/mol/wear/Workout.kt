package app.mol.wear

import org.json.JSONObject

data class Exercise(val name: String, val sets: Int, val reps: Int, val load: Float)
data class LoggedSet(val exercise: String, val index: Int, val reps: Int, val load: Float)

const val REST_SECONDS = 90
private const val LOAD_STEP = 2.5f

/** Immutable workout state; the UI only renders it and calls the functions below. */
data class Workout(
    val title: String,
    val exercises: List<Exercise>,
    val exerciseIdx: Int = 0,
    val setIdx: Int = 0,
    val reps: Int = exercises.firstOrNull()?.reps ?: 0,
    val load: Float = exercises.firstOrNull()?.load ?: 0f,
    val restLeft: Int = 0,
    val log: List<LoggedSet> = emptyList(),
) {
    val current: Exercise? get() = exercises.getOrNull(exerciseIdx)
    val resting: Boolean get() = restLeft > 0
    val done: Boolean get() = exerciseIdx >= exercises.size

    fun adjustLoad(steps: Int) = copy(load = (load + steps * LOAD_STEP).coerceAtLeast(0f))
    fun adjustReps(delta: Int) = copy(reps = (reps + delta).coerceAtLeast(1))

    fun logSet(): Workout {
        val ex = current ?: return this
        val next = log + LoggedSet(ex.name, setIdx, reps, load)
        val lastSet = setIdx + 1 >= ex.sets
        val ei = if (lastSet) exerciseIdx + 1 else exerciseIdx
        val upcoming = exercises.getOrNull(ei)
        return copy(
            exerciseIdx = ei,
            setIdx = if (lastSet) 0 else setIdx + 1,
            // the next set starts from what was just done; a new exercise from its plan
            reps = if (lastSet) upcoming?.reps ?: reps else reps,
            load = if (lastSet) upcoming?.load ?: load else load,
            restLeft = if (upcoming == null) 0 else REST_SECONDS,
            log = next,
        )
    }

    fun tick() = if (resting) copy(restLeft = restLeft - 1) else this
    fun skipRest() = copy(restLeft = 0)

    companion object {
        fun parse(json: String): Workout {
            val o = JSONObject(json)
            val arr = o.getJSONArray("exercicios")
            val list = (0 until arr.length()).map {
                val e = arr.getJSONObject(it)
                Exercise(e.getString("nome"), e.getInt("series"), e.getInt("reps"), e.getDouble("carga").toFloat())
            }
            return Workout(o.getString("nome"), list)
        }
    }
}
