/* Start: Profilwahl oder direkt in die App */
window.STUDYOS_GUARD && (STUDYOS_GUARD.scripts = performance.now());
if (window.STUDYOS_PID) App.boot(); else StudyProfiles.picker();
window.STUDYOS_GUARD && (STUDYOS_GUARD.ready = performance.now());
