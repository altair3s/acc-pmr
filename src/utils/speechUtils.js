/**
 * Fonction pour générer une alerte vocale
 * @param {string} text - Le texte à prononcer
 * @param {string} lang - La langue (fr-FR par défaut)
 * @param {number} volume - Volume de 0 à 1 (1 par défaut)
 * @param {number} rate - Vitesse de parole de 0.1 à 10 (1 par défaut)
 * @param {number} pitch - Tonalité de 0 à 2 (1 par défaut)
 */
export const speakText = (text, lang = 'fr-FR', volume = 1, rate = 1, pitch = 1) => {
    // Vérifier si l'API Speech est disponible
    if ('speechSynthesis' in window) {
      // Arrêter toute voix en cours
      window.speechSynthesis.cancel();
      
      // Créer un nouvel objet SpeechSynthesisUtterance
      const utterance = new SpeechSynthesisUtterance();
      
      // Définir le texte et les paramètres
      utterance.text = text;
      utterance.lang = lang;
      utterance.volume = volume;
      utterance.rate = rate;
      utterance.pitch = pitch;
      
      // Optionnel: sélectionner une voix spécifique
      
      window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(voice => voice.lang === 'en-EN');
        if (frenchVoice) {
          utterance.voice = frenchVoice;
        }
      };
      
      
      // Déclencher la synthèse vocale
      window.speechSynthesis.speak(utterance);
      
      return true;
    } else {
      console.warn("L'API Speech Synthesis n'est pas disponible dans ce navigateur");
      return false;
    }
  };