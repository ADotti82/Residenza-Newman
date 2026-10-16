/**
 * ============================================================================
 * RESIDENZA CARDINAL NEWMAN - CORE CONFIG & CONSTANTS
 * ============================================================================
 */

export const STORAGE_KEYS = {
  USER: "newman_user_data",
  BACKEND_URL: "newman_gas_backend_url",
  LOCAL_DB: "newman_local_mock_db",
  BYPASS_TIME_LOCK: "newman_bypass_time_lock",
  MENU_14_GIORNI: "newman_menu_14_giorni"
};

// URL predefinito del Backend Google Apps Script per tutti i residenti
export const DEFAULT_GAS_URL = "https://script.google.com/macros/s/AKfycbys9aPfUH6PXGCmHPDWset6pgvwG1kmxUlDFv3Yaiq8uAfp_2uiswm7DNd8_tQqDHHxVg/exec";

// Data di ancoraggio per la Settimana 1 del Menu: Lunedì 21 Settembre 2026
export const MENU_ANCHOR_DATE = new Date("2026-09-21T00:00:00");

// Componenti standard della Busta
export const CLASSICI_BUSTA = [
  { icon: "🥖", nome: "Panino o Focaccia imbottita", desc: "Farcito con salumi o formaggi" },
  { icon: "🍎", nome: "Frutta fresca di stagione", desc: "Mela, banana o frutto del giorno (o succo)" },
  { icon: "🍪", nome: "Snack / Dolce", desc: "Biscotti o merendina confezionata" },
  { icon: "💧", nome: "Acqua minerale", desc: "Bottiglietta da 50 cl" }
];

// Menu ciclico di 14 giorni
export const DEFAULT_MENU_14_GIORNI = {
  settimana1: {
    lunedi: {
      pranzo: { primo: "Paella di carne alla Valenciana", secondo: "Saltimbocca alla Romana", contorno: "Insalata di cetrioli, pomodori e cipolla", contorno2: "Spinaci", dessert: "Frutta fresca" },
      cena: { primo: "Spaghetti alle vongole", secondo: "Scaloppine di Tacchino", contorno: "Fagioli", contorno2: "Insalata mista", dessert: "Frutta fresca" }
    },
    martedi: {
      pranzo: { primo: "Tortellini alla Boscaiola", secondo: "Cotolette di Pollo (panate)", contorno: "Finocchi Julienne al Forno", contorno2: "Insalata mista", dessert: "Frutta fresca", opzioneBustaDisponibile: true },
      cena: { primo: "Linguine al profumo di mare", secondo: "Salmone al Forno", contorno: "Piselli all'olio", contorno2: "Insalata mista", dessert: "Frutta fresca" }
    },
    mercoledi: {
      pranzo: { primo: "Paccheri al salmone e pomodorini", secondo: "Cotoletta alla milanese", contorno: "Zucchine ripassate", contorno2: "Insalata mista", dessert: "Frutta fresca" },
      cena: { primo: "Risotto al radicchio", secondo: "Straccetti con rucola", contorno: "Insalata di pomodori e cetrioli", contorno2: "Patate gratinate", dessert: "Frutta fresca" }
    },
    giovedi: {
      pranzo: { primo: "Pasta cacio e pepe", secondo: "Insalata di pollo saporita", contorno: "Carote Julienne ripassate", contorno2: "Insalata mista", dessert: "Frutta fresca", opzioneBustaDisponibile: true },
      cena: { primo: "Pasta allo zafferano e gorgonzola", secondo: "Sovracoscia di Tacchino", contorno: "Patatine fritte", contorno2: "Insalata mista", dessert: "Frutta fresca" }
    },
    venerdi: {
      pranzo: { primo: "Risotto alla Marinara", secondo: "Frittura di Calamari", contorno: "Melanzane al Forno", contorno2: "Insalata mista", dessert: "Frutta fresca" },
      cena: { primo: "Paccheri al sugo di calamari", secondo: "Pesce Spada grigliato con pomodori e olive", contorno: "Carciofi ripassati", contorno2: "Insalata mista", dessert: "Frutta fresca" }
    },
    sabato: {
      pranzo: { primo: "Pasta al ragù di carne", secondo: "Straccetti con rucola", contorno: "Zucchine ripassate", contorno2: "Insalata mista", dessert: "Frutta fresca" },
      cena: { primo: "Supplì e arancini", secondo: "Insalata di patate tonnate con uova sode", contorno: "Finocchi Julienne", contorno2: "Insalata mista", dessert: "Dolce della casa" }
    },
    domenica: {
      pranzo: { primo: "Fettuccine alla papalina", secondo: "Bistecca di manzo alla griglia", contorno: "Patate al forno", contorno2: "Insalata mista", dessert: "Dolce festivo" },
      cena: { primo: "Spaghetti aglio olio e peperoncino", secondo: "Pollo tonnato", contorno: "Pomodori rossi", contorno2: "Carote", dessert: "Frutta fresca" }
    }
  },
  settimana2: {
    lunedi: {
      pranzo: { primo: "Ravioli Burro e Salvia", secondo: "Polpette di Carne fatte in casa", contorno: "Fagiolini", contorno2: "Insalata mista", dessert: "Frutta fresca" },
      cena: { primo: "Pasta al pesto", secondo: "Gamberoni in Padella", contorno: "Pomodori e basilico all'olio", contorno2: "Biete", dessert: "Frutta fresca" }
    },
    martedi: {
      pranzo: { primo: "Spaghetti allo scoglio", secondo: "Polpo con patate", contorno: "Carciofi", contorno2: "Insalata mista", dessert: "Frutta fresca", opzioneBustaDisponibile: true },
      cena: { primo: "Spaghetti alle Cozze", secondo: "Salmone gratinato", contorno: "Carote Prezzemolate", contorno2: "Insalata mista", dessert: "Frutta fresca" }
    },
    mercoledi: {
      pranzo: { primo: "Parmigiana al ragù", secondo: "Saltimbocca alla Romana", contorno: "Melanzane", contorno2: "Insalata mista", dessert: "Frutta fresca" },
      cena: { primo: "Risotto Asparagi e Speck", secondo: "Arrosto", contorno: "Fagioli", contorno2: "Insalata mista", dessert: "Frutta fresca" }
    },
    giovedi: {
      pranzo: { primo: "Pasta alle Vongole", secondo: "Pollo sovracoscia o cosce di pollo", contorno: "Pomodori rossi", contorno2: "Patate lesse", dessert: "Frutta fresca", opzioneBustaDisponibile: true },
      cena: { primo: "Linguine al pomodoro fresco di stagione", secondo: "Straccetti con rucola", contorno: "Tris di Verdure estive", contorno2: "Insalata mista", dessert: "Frutta fresca" }
    },
    venerdi: {
      pranzo: { primo: "Riso alla cantonese", secondo: "Spigola al forno", contorno: "Bieta ripassata", contorno2: "Insalata mista", dessert: "Frutta fresca" },
      cena: { primo: "Farfalle al Salmone", secondo: "Branzino al cartoccio", contorno: "Insalata di cetrioli pomodori e cipolla", contorno2: "Melanzane gratinate o al forno con mozzarella", dessert: "Frutta fresca" }
    },
    sabato: {
      pranzo: { primo: "Pasta alla Carbonara", secondo: "Arista di maiale", contorno: "Tris di verdure estive", contorno2: "Insalata mista", dessert: "Frutta fresca" },
      cena: { primo: "Torta salata", secondo: "Insalata di tonno", contorno: "Insalata di carote", contorno2: "Insalata mista", dessert: "Dolce della casa" }
    },
    domenica: {
      pranzo: { primo: "Cannelloni di carne al forno", secondo: "Pollo arrosto o petto di pollo alla norma", contorno: "Patate caramellate", contorno2: "Insalata mista", dessert: "Dolce festivo" },
      cena: { primo: "Tagliatelle paglia e fieno", secondo: "Braciole di maiale", contorno: "Pomodori rossi", contorno2: "Finocchi al forno", dessert: "Frutta fresca" }
    }
  }
};

// Database Mock Locale iniziale
export const INITIAL_MOCK_DB = {
  utenti: [
    { email: "donandreadotti@gmail.com", nome: "Don Andrea Dotti", stato: "Approvato", is_utente_mensa: true, perm_mensa: true, perm_manutenzione: true, perm_spazi: true, perm_admin: true, notif_manutenzione: true, notif_spazi: true, notif_push: true, password: "newman2026" },
    { email: "donrocco@newman.it", nome: "Don Rocco", stato: "Approvato", is_utente_mensa: true, perm_mensa: false, perm_manutenzione: false, perm_spazi: false, perm_admin: false, notif_manutenzione: false, notif_spazi: false, notif_push: false, password: "newman2026" },
    { email: "donsergio@newman.it", nome: "Don Sergio", stato: "Approvato", is_utente_mensa: true, perm_mensa: false, perm_manutenzione: false, perm_spazi: false, perm_admin: false, notif_manutenzione: false, notif_spazi: false, notif_push: false, password: "newman2026" },
    { email: "francesco.studente@newman.it", nome: "Francesco Rossi", stato: "Approvato", is_utente_mensa: true, perm_mensa: false, perm_manutenzione: false, perm_spazi: false, perm_admin: false, notif_manutenzione: false, notif_spazi: false, notif_push: false, password: "newman2026" }
  ],
  mensa: [
    { id: "M_001", data: "2026-09-15", email: "donrocco@newman.it", tipo_pasto: "pranzo", busta: true, ritardo: false, ospiti: 0, stato_presenza: "Presente", note: "Busta asporto per convegno", timestamp: "2026-09-14T18:00:00Z" },
    { id: "M_002", data: "2026-09-15", email: "donsergio@newman.it", tipo_pasto: "pranzo", busta: true, ritardo: false, ospiti: 1, stato_presenza: "Presente", note: "Busta per me e collega", timestamp: "2026-09-14T19:00:00Z" },
    { id: "M_003", data: "2026-09-16", email: "donrocco@newman.it", tipo_pasto: "pranzo", busta: false, ritardo: false, ospiti: 0, stato_presenza: "Presente", note: "Piatto standard", timestamp: "2026-09-16T09:00:00Z" },
    { id: "M_004", data: "2026-09-16", email: "donandreadotti@gmail.com", tipo_pasto: "pranzo", busta: false, ritardo: true, ospiti: 0, stato_presenza: "Ritardo", note: "Arrivo alle 13:45 causa lezioni", timestamp: "2026-09-16T09:30:00Z" },
    { id: "M_005", data: "2026-09-16", email: "francesco.studente@newman.it", tipo_pasto: "cena", busta: false, ritardo: false, ospiti: 2, stato_presenza: "Presente", note: "Ospiti familiari a cena", timestamp: "2026-09-16T14:00:00Z" },
    { id: "M_006", data: "2026-09-17", email: "donsergio@newman.it", tipo_pasto: "pranzo", busta: true, ritardo: false, ospiti: 0, stato_presenza: "Presente", note: "Busta per rientro tardivo", timestamp: "2026-09-16T18:00:00Z" },
    { id: "M_007", data: "2026-09-18", email: "donrocco@newman.it", tipo_pasto: "cena", busta: false, ritardo: false, ospiti: 0, stato_presenza: "assente", note: "Cena fuori per impegno pastorale", timestamp: "2026-09-18T10:00:00Z" },
    { id: "M_008", data: "2026-09-22", email: "francesco.studente@newman.it", tipo_pasto: "pranzo", busta: true, ritardo: false, ospiti: 0, stato_presenza: "Presente", note: "Busta pranzo martedì", timestamp: "2026-09-21T16:00:00Z" },
    { id: "M_009", data: "2026-09-24", email: "donandreadotti@gmail.com", tipo_pasto: "pranzo", busta: true, ritardo: false, ospiti: 0, stato_presenza: "Presente", note: "Busta pranzo giovedì", timestamp: "2026-09-23T15:00:00Z" },
    { id: "M_010", data: "2026-09-25", email: "donsergio@newman.it", tipo_pasto: "cena", busta: false, ritardo: true, ospiti: 1, stato_presenza: "Presente", note: "Ritardo con ospite", timestamp: "2026-09-25T14:00:00Z" },
    { id: "M_011", data: "2026-10-08", email: "francesco.studente@newman.it", tipo_pasto: "pranzo", busta: false, ritardo: false, ospiti: 0, stato_presenza: "assente", note: "Assenza programmata: Studio / Esami", timestamp: "2026-10-07T14:00:00Z" },
    { id: "M_012", data: "2026-10-09", email: "donsergio@newman.it", tipo_pasto: "pranzo", busta: false, ritardo: false, ospiti: 0, stato_presenza: "assente", note: "Assenza programmata: Ministero pastorale", timestamp: "2026-10-06T10:00:00Z" },
    { id: "M_013", data: "2026-10-09", email: "donsergio@newman.it", tipo_pasto: "cena", busta: false, ritardo: false, ospiti: 0, stato_presenza: "assente", note: "Assenza programmata: Ministero pastorale", timestamp: "2026-10-06T10:00:00Z" },
    { id: "M_014", data: "2026-10-10", email: "donsergio@newman.it", tipo_pasto: "pranzo", busta: false, ritardo: false, ospiti: 0, stato_presenza: "assente", note: "Assenza programmata: Ministero pastorale", timestamp: "2026-10-06T10:00:00Z" },
    { id: "M_015", data: "2026-10-10", email: "donsergio@newman.it", tipo_pasto: "cena", busta: false, ritardo: false, ospiti: 0, stato_presenza: "assente", note: "Assenza programmata: Ministero pastorale", timestamp: "2026-10-06T10:00:00Z" },
    { id: "M_016", data: "2026-10-11", email: "donsergio@newman.it", tipo_pasto: "pranzo", busta: false, ritardo: false, ospiti: 0, stato_presenza: "assente", note: "Assenza programmata: Ministero pastorale", timestamp: "2026-10-06T10:00:00Z" },
    { id: "M_017", data: "2026-10-11", email: "donsergio@newman.it", tipo_pasto: "cena", busta: false, ritardo: false, ospiti: 0, stato_presenza: "assente", note: "Assenza programmata: Ministero pastorale", timestamp: "2026-10-06T10:00:00Z" }
  ],
  assenze: [
    {
      id: "ASS_001",
      email: "francesco.studente@newman.it",
      nome: "Francesco Rossi",
      data_inizio: "2026-10-08",
      data_fine: "2026-10-08",
      motivo: "Studio / Esami",
      note: "Sessione esami all'università per l'intera giornata",
      assente_mensa: true,
      pasti_interessati: ["pranzo"],
      created_at: "2026-10-07T14:00:00Z"
    },
    {
      id: "ASS_002",
      email: "donsergio@newman.it",
      nome: "Don Sergio",
      data_inizio: "2026-10-09",
      data_fine: "2026-10-11",
      motivo: "Ministero pastorale",
      note: "Esercizi spirituali fuori sede",
      assente_mensa: true,
      pasti_interessati: ["pranzo", "cena"],
      created_at: "2026-10-06T10:00:00Z"
    }
  ],
  accoglienza: [
    {
      id: "ACC_001", data_richiesta: "2026-09-20T10:00:00Z",
      richiedente_email: "francesco.studente@newman.it", richiedente_nome: "Francesco Rossi",
      nome_ospite: "Prof. Mario Rossi", data_checkin: "2026-09-25", data_checkout: "2026-09-27",
      numero_ospiti: 1, camera_preferita: "Camera 1", camera_assegnata: "Camera 1",
      stato: "Confermata", auth1_email: "donandreadotti@gmail.com", auth1_data: "2026-09-21T09:00:00Z",
      auth2_email: "donandreadotti@gmail.com", auth2_data: "2026-09-22T08:30:00Z",
      note: "Docente in visita accademica"
    },
    {
      id: "ACC_002", data_richiesta: new Date().toISOString(),
      richiedente_email: "donrocco@newman.it", richiedente_nome: "Don Rocco",
      nome_ospite: "Mons. Giovanni Bianchi", data_checkin: "2026-10-10", data_checkout: "2026-10-12",
      numero_ospiti: 1, camera_preferita: "Camera 2", camera_assegnata: "",
      stato: "In Attesa 1a Autorizzazione", auth1_email: "", auth1_data: "",
      auth2_email: "", auth2_data: "",
      note: "Predicatore per il ritiro diocesano dei residenti"
    }
  ],
  prenotazioni_spazi: [
    { id: "S_001", risorsa: "Chiesa", data: "2026-09-16", slot_orario: "07:00 - 07:30", email: "donrocco@newman.it", timestamp: "2026-09-15T20:00:00Z", stato: "Approvata" },
    { id: "S_002", risorsa: "Sala TV", data: "2026-09-16", slot_orario: "20:30 - 21:00", email: "donsergio@newman.it", timestamp: "2026-09-15T21:00:00Z", stato: "Approvata" },
    { id: "S_003", risorsa: "Chiesa", data: "2026-09-16", slot_orario: "18:00 - 18:30", email: "donandreadotti@gmail.com", timestamp: "2026-09-16T08:00:00Z", stato: "Approvata" },
    { id: "S_004", risorsa: "Chiesa", data: "2026-10-07", slot_orario: "08:30 - 09:00", email: "donrocco@newman.it", timestamp: new Date().toISOString(), stato: "In Attesa", approvato_da: "", note: "S. Messa con familiari in visita" },
    { id: "S_005", risorsa: "Sala TV", data: "2026-10-08", slot_orario: "21:30 - 22:00", email: "francesco.studente@newman.it", timestamp: new Date().toISOString(), stato: "In Attesa", approvato_da: "", note: "Gruppo di studio per esame universitario" }
  ],
  bacheca: [
    { id: "B_001", tipo: "compleanno", data: "2026-09-16", titolo: "Buon Compleanno Don Andrea Dotti!", descrizione: "La comunità della Residenza si unisce in preghiera e festa per il compleanno del nostro Padre Direttore!", autore: "Direzione", priorita: "alta", timestamp: "2026-09-16T06:00:00Z" },
    { id: "B_002", tipo: "anniversario", data: "2026-09-16", titolo: "Anniversario di Ordinazione Presbiterale", descrizione: "15° anniversario sacerdotale di Don Rocco. Ricordiamolo con gratitudine nella S. Messa comunitaria.", autore: "Comunità", priorita: "normale", timestamp: "2026-09-16T06:30:00Z" },
    { id: "B_003", tipo: "evento", data: "2026-09-16", titolo: "Proiezione Partita & Serata Fraterna in Sala TV", descrizione: "Stasera dalle ore 20:45 visione comunitaria in Sala TV con tisane e biscotti per tutti i residenti.", autore: "Comitato Residenti", priorita: "normale", timestamp: "2026-09-16T08:00:00Z" },
    { id: "B_004", tipo: "avviso", data: "2026-09-17", titolo: "Ritiro Spirituale di Inizio Anno Accademico", descrizione: "Sabato mattina momento di meditazione e adorazione in Cappella guidato dal Padre Spirituale, seguito da pranzo insieme.", autore: "Direzione", priorita: "alta", timestamp: "2026-09-15T10:00:00Z" }
  ],
  manutenzione: [
    { id: "SEG_001", timestamp: "2026-09-14T11:20:00Z", email: "donrocco@newman.it", categoria: "manutenzione", luogo: "Bagno Piano 2", descrizione: "Perdita d'acqua dal rubinetto del lavabo al piano 2", link_foto: "", priorita: "Alta", stato: "In Lavorazione", note_intervento: "Contattato idraulico convenzionato per sostituzione guarnizione", tecnico: "Idraulico Mario", data_chiusura: "" },
    { id: "SEG_002", timestamp: "2026-09-12T16:00:00Z", email: "donandreadotti@gmail.com", categoria: "servizi", luogo: "Lavanderia Comune", descrizione: "Mancanza detersivi e richiesta sanificazione cestelli lavatrice 2", link_foto: "", priorita: "Media", stato: "Risolto", note_intervento: "Riforniti flaconi detersivo e igienizzati i cestelli dalla cooperativa", tecnico: "Impresa Pulizie", data_chiusura: "2026-09-13T10:00:00Z" },
    { id: "SEG_003", timestamp: "2026-09-18T09:15:00Z", email: "donsergio@newman.it", categoria: "manutenzione", luogo: "Camera 204", descrizione: "Sfarfallio lampadario principale e presa elettrica allentata", link_foto: "", priorita: "Media", stato: "Risolto", note_intervento: "Sostituito alimentatore LED e fissata presa", tecnico: "Elettricista Luigi", data_chiusura: "2026-09-19T14:30:00Z" },
    { id: "SEG_004", timestamp: "2026-09-22T14:00:00Z", email: "francesco.studente@newman.it", categoria: "manutenzione", luogo: "Stanza 108", descrizione: "Condizionatore emette aria poco fredda e rumore anomalo della ventola", link_foto: "", priorita: "Alta", stato: "In Lavorazione", note_intervento: "In attesa pezzo di ricambio ventola split", tecnico: "Ditta ClimaTech", data_chiusura: "" },
    { id: "SEG_005", timestamp: "2026-09-24T18:40:00Z", email: "donrocco@newman.it", categoria: "servizi", luogo: "Corridoio Piano 1", descrizione: "Richiesta passaggio aspirapolvere e pulizia approfondita vetrate", link_foto: "", priorita: "Bassa", stato: "Aperta", note_intervento: "", tecnico: "", data_chiusura: "" },
    { id: "SEG_006", timestamp: "2026-09-27T10:05:00Z", email: "donandreadotti@gmail.com", categoria: "manutenzione", luogo: "Chiesa / Cappella", descrizione: "Maniglia della porta laterale dissaldata e chiusura difficoltosa", link_foto: "", priorita: "Media", stato: "Aperta", note_intervento: "Da concordare sopralluogo fabbro/falegname", tecnico: "", data_chiusura: "" },
    { id: "SEG_007", timestamp: "2026-09-28T08:30:00Z", email: "donsergio@newman.it", categoria: "manutenzione", luogo: "Cucina Comunitaria", descrizione: "Gocciolamento sifone sotto il lavello principale", link_foto: "", priorita: "Alta", stato: "Risolto", note_intervento: "Sostituito manicotto di scarico e serrato raccordo", tecnico: "Idraulico Mario", data_chiusura: "2026-09-28T16:00:00Z" }
  ],
  configurazione: {
    Messaggio_Supermaster: "Cari sacerdoti e residenti, benvenuti nella nostra Residenza. Ricordo a tutti che gli orari di mensa vanno rispettati per agevolare il servizio della cuoca. Per qualsiasi esigenza pastorale o accademica la porta della Direzione è sempre aperta.",
    Messaggio_Supermaster_Titolo: "Comunicazione della Direzione",
    Messaggio_Supermaster_Data_Pubblicazione: "2026-10-01",
    Messaggio_Supermaster_Data_Scadenza: "",
    Data_Variazione_Menu: "2026-09-16",
    Testo_Variazione: "Oggi a pranzo dessert sostituito con Gelato artigianale offerto dalla Direzione per la festa della Residenza!",
    Pasto_Variazione: "pranzo",
    Nome_Camera_1: "Camera Newman",
    Nome_Camera_2: "Camera San Filippo Neri",
    Nome_Camera_3: "Camera Santa Teresa",
    Max_Ospiti_Mensa: "5",
    Orario_Limite_Pranzo: "09:00",
    Orario_Limite_Cena: "14:30",
    Orario_Limite_Busta: "14:00",
    Email_Notifiche_Master: "donandreadotti@gmail.com",
    Email_Mittente_Segnalazioni: "donandreadotti@gmail.com",
    Email_Amministrazione_Manutenzione: "amministrazione@residenzanewman.org",
    Info_Regolamento: `REGOLAMENTO INTERNO DELLA RESIDENZA CARDINAL NEWMAN
1. VITA COMUNITARIA: Il clima di studio, preghiera e fraternità sacerdotale e accademica è alla base della nostra convivenza.
2. ORARI DI SILENZIO: Dalle ore 23:00 alle ore 07:30 del mattino è richiesto il silenzio nei corridoi e negli spazi comuni per favorire il riposo e la preghiera.
3. MENSA COMUNITARIA:
   • Pranzo alle 14:30.
   • Cena alle 19:30.
   • Martedì e Giovedì a pranzo: pasto, frutta e snack/dolce, acqua e succo.
4. PRENOTAZIONE DEGLI SPAZI COMUNI:
   • Gli unici spazi soggetti a richiesta di prenotazione sono la Chiesa / Cappella e la Sala TV.
   • Gli slot sono di 30 minuti ciascuno. Ogni prenotazione costituisce una richiesta soggetta ad autorizzazione del Master.
   • Riservatezza: l'utente visualizza le proprie richieste; il Master visualizza l'occupante; tutti gli altri residenti vedono lo slot come 'Occupato' o 'In Valutazione'.
5. ACCOGLIENZA E OSPITALITÀ:
   • La disponibilità delle 3 camere dedicate è gestita tramite procedura a doppia autorizzazione.
6. MANUTENZIONE E CURA DEI LOCALI:
   • Qualsiasi guasto o anomalia in camera o nelle aree comuni va tempestivamente registrato nell'apposita sezione Guasti.`,
    Info_Contatti: `CONTATTI E RECAPITI DELLA RESIDENZA:
• Portineria / Accoglienza: Tel. +39 06 87654321 (Int. 101) - Attiva 07:00 - 22:30
• Direzione Generale: direzione@residenzanewman.org (Int. 102)
• Emergenze Notturne Custode: +39 333 1122334
• Economato & Servizio Mensa: mensa@residenzanewman.org
• Assistenza Tecnica Manutenzione: manutenzione@residenzanewman.org`
  }
};
