import admin from 'firebase-admin';

// Initialize the app with a service account
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: "flowpilot-45d37",
        clientEmail: "firebase-adminsdk-fbsvc@flowpilot-45d37.iam.gserviceaccount.com",
        // Replace newlines in the private key
        privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCmghoyGEOWSUYK\nQYYxrFW/CTZgZ4R1fJ1dlzG6mxShrSu9xogM06Ln1AicKI9xRSLC7z0JOrAUgblN\n+zIa+w8KfRp3i/c9VIr0wpvxmIBpSkc0IfwhWF4AxHLjcJ6uDqg1R3Ajbjn2TjY1\nJ4Kc4MNvsrQbzUAw27+rTSfWIAQkG2yiLOuN7xF7x3FGnpYK48WieFWdgJTqYx0M\nKa5nmpPpoDxVGssQonRBopZvTnlab+gUeaBlb551t5niCXfLmlmCfgz6Pah/z1gZ\nSi6vuTDaslUtfgSfeYG7bOLJug79eCS8Y7jnWbzFxMx5IEEmzO3VkzWGqB7naPyo\nFN78s5K3AgMBAAECggEANCVlp8+ihxP+i+K2cKMMnY34ihuRR6wVqoRZzhuYTAPs\nQXxGCmJTT/A/HAy10573wn3jKxtGnr17t5jWOc3riXjhi5P5g6sQ85No/DIq8Q6S\nmxiTmivPEMV1R5ZzE4bCliD/1RDFtUYMQvxTMudPPZGFR3mxwztm3PKGadBQC7BK\n6A0EJSBfnZgr5mjVkiN4ekZew3G6ygZjwKZFVRW0Uf8ANc+/i1JkyUSZGukoeLfA\nt8d5D3IprRnV7SYP3Tor2b+sWBk07Gk8C80f6gzUNwVmig9pCHgm1M548OYuzxHI\n81s71zCB3LuyLTF/KOTlOQQsuzgcONwd0BkkA7Sl3QKBgQDmw3xNYBGQcJjexT2K\nQnsg7Gt68QnNgXvyGZQ8CL0Bsj7owSElB/rxGwG2NGUtnikoyAswSt/mjumZyApY\nHFx7H44XgO1ROTlRvAhDn6muxe7ktMcJ0FTBYCmXL25MlwW0ke+e5827eZo/fZav\nZ6QQLA60RNTRtbcxht2bGuxtAwKBgQC4t7TzJIw6R3KH686yDZueYmJH1SNgQXe7\nPv4R1QbtHcaKnfXT0ik5DbpMGHuaulWCfib4XwW5EhxGEx/IrR1WoegOX2T+6o8b\n8ryft8/RdeNxrPh5R5ReG6W1quiFvC8/E7T241KXd91B3azTZ8lKc6+TtLPocdUI\nkyZwFOIzPQKBgQCQRjwa7CtPEPaioNKe9H2i0e1IyhaE46WocZGaDySMQPLP9p9Q\nVbLwtx/U2OFBKhc1pgxIvydJMKSgPs8o02KGn+3oh/TXyV0q2tKX5OTjnmCDoPqo\nChZTaFnYahEd1XX9tRgJU4fu5FIpy81AER4j9kejMT2Vd3T3hAhdBvI2HQKBgQCk\n2v/ZyJKGKOHkwOW2L0Ll9jR0m5p4+7TaHnwuegs2cE6TxCpzo6s6yi+sXmViUE6k\nqeYp4NSAudMWD1dciHQYr2MmAKlogPq8HMWPXkNRU39sIs2Xn/SgkNgx7JidUrhv\n+SyW84bwu/9yG191Rbl2gwz+LFYsa/uPLZUujtTamQKBgQDcvuQNQpDYWl2wcSE/\nqFwgZvEUsqdAruw0+7rcc9bqA7FFVE1nETy6nCRqYhmlwYDnKCM5MW3G3l/rkGGu\nuj1SvYun2mu2Ij28iPmcZvmo/5hASIWo05HE/ZE3znlpVnSduOTl5mVR5ES4YTEt\nzUGM6VRL3pEJMSIn//q3IzGcxg==\n-----END PRIVATE KEY-----\n",
      })
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const firestore = admin.firestore();