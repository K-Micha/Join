// #region Storage state
const storageState = {
  useFirebase: false,
  firebaseBaseUrl: "",
  contactsKey: "joinContacts",
};
// #endregion

// #region Public API
/**
 * Loads contacts from the active storage provider.
 */
async function loadContacts() {
  if (!storageState.useFirebase) return loadContactsFromLocal();
  return await loadContactsFromFirebase();
}

/**
 * Saves contacts to the active storage provider.
 * @param {Array} list
 */
async function saveContacts(list) {
  if (!storageState.useFirebase) {
    saveContactsToLocal(list);
    return true;
  }
  return await saveContactsToFirebase(list);
}
// #endregion

// #region Local storage
/**
 * Loads contacts from localStorage.
 */
function loadContactsFromLocal() {
  const raw = localStorage.getItem(storageState.contactsKey);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (error) {
    return [];
  }
}

/**
 * Saves contacts to localStorage.
 * @param {Array} list
 */
function saveContactsToLocal(list) {
  localStorage.setItem(storageState.contactsKey, JSON.stringify(list || []));
}
// #endregion

// #region Firebase
/**
 * Loads contacts from Firebase Realtime Database.
 */
async function loadContactsFromFirebase() {
  const url = buildFirebaseUrl("contacts.json");
  const response = await fetch(url);
  const data = await response.json();
  if (!data) return [];
  const list = Object.values(data);
  return Array.isArray(list) ? list : [];
}

/**
 * Saves contacts to Firebase Realtime Database.
 * @param {Array} list
 */
async function saveContactsToFirebase(list) {
  const url = buildFirebaseUrl("contacts.json");
  const body = buildFirebaseContactsPayload(list || []);
  const response = await fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body });
  return response.ok;
}

/**
 * Builds the Firebase payload as an object keyed by contact id.
 * @param {Array} list
 */
function buildFirebaseContactsPayload(list) {
  const payload = {};
  for (let index = 0; index < list.length; index++) payload[list[index].id] = list[index];
  return JSON.stringify(payload);
}

/**
 * Builds a normalized Firebase URL for a given path.
 * @param {string} path
 */
function buildFirebaseUrl(path) {
  const baseUrl = String(storageState.firebaseBaseUrl || "").trim();
  if (!baseUrl) return path;
  return (baseUrl.endsWith("/") ? baseUrl : baseUrl + "/") + path;
}
// #endregion