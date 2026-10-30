package app.mol.wear

import org.junit.Assert.*
import org.junit.Test

class WorkoutTest {
    private val w = Workout("t", listOf(Exercise("A", 2, 10, 40f), Exercise("B", 1, 8, 20f)))

    @Test fun logSetStartsRestAndKeepsAdjustedValues() {
        val s = w.adjustLoad(2).adjustReps(-1).logSet()
        assertEquals(REST_SECONDS, s.restLeft)
        assertEquals(1, s.setIdx)
        assertEquals(LoggedSet("A", 0, 9, 45f), s.log.single())
        assertEquals(45f, s.load, 0f) // next set starts from what was just done
    }

    @Test fun lastSetMovesToNextExerciseWithItsPlan() {
        val s = w.logSet().skipRest().logSet()
        assertEquals("B", s.current?.name)
        assertEquals(0, s.setIdx)
        assertEquals(20f, s.load, 0f)
        assertEquals(8, s.reps)
    }

    @Test fun finishingSkipsRestAndEndsWorkout() {
        val s = w.logSet().skipRest().logSet().skipRest().logSet()
        assertTrue(s.done)
        assertFalse(s.resting)
        assertEquals(3, s.log.size)
    }

    @Test fun tickCountsDownOnlyWhileResting() {
        assertEquals(w, w.tick())
        assertEquals(REST_SECONDS - 1, w.logSet().tick().restLeft)
    }

    @Test fun loadAndRepsNeverGoBelowLimits() {
        assertEquals(0f, w.adjustLoad(-100).load, 0f)
        assertEquals(1, w.adjustReps(-100).reps)
    }

    @Test fun parsesPlan() {
        val p = Workout.parse("""{"nome":"X","exercicios":[{"nome":"Supino","series":3,"reps":10,"carga":42.5}]}""")
        assertEquals(Exercise("Supino", 3, 10, 42.5f), p.exercises.single())
    }
}
