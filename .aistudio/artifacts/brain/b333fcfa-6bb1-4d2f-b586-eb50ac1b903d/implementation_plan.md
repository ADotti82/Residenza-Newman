# Piano di Implementazione – Rifiniture Tecniche Post-Audit

Questo piano recepisce i punti emersi dall'audit funzionale per completare e perfezionare l'esperienza d'uso dell'applicazione Residenza Newman.

## 1. Obiettivi degli interventi

1. **Allineamento Feedback Connessione Google Fogli (BUG-01)**:
   - Sincronizzare la visualizzazione del risultato del ping sia nell'elemento `#master-gas-test-result` (usato nel pannello Master) sia nell'eventuale `#gas-test-result` (usato nei controlli rapidi), eliminando incoerenze di visualizzazione.

2. **Ottimizzazione UI/Viewport Mobile per la Guida (BUG-02)**:
   - Fissare la barra inferiore (`flex-shrink: 0`) della finestra di dialogo della guida dell'app e abilitare lo scorrimento indipendente del contenuto centrale per prevenire compressioni grafiche su smartphone con tastiera virtuale aperta.

3. **Preservazione Stato Utente al Ripristino Assenze (BUG-03)**:
   - Quando viene revocata o cancellata un'assenza programmata, conservare eventuali note pre-esistenti o preferenze del residente invece di azzerarle a valori generici.

4. **Verifica & Compilazione**:
   - Eseguire `compile_applet` e collaudo finale di integrità.
