import type { Entry } from '../store/entries';

const firebaseConfig = {
  apiKey: 'AIzaSyBhuxv8Myog0DrYx_1lOkTgAKy6nrrfzbE',
  authDomain: 'deary-app-ff355.firebaseapp.com',
  projectId: 'deary-app-ff355',
  storageBucket: 'deary-app-ff355.firebasestorage.app',
  messagingSenderId: '986357757707',
  appId: '1:986357757707:web:573a622e4b91efe0d9940e',
  measurementId: 'G-YGFR7TE6Z5',
};

const COLLECTION = 'diaryEntries';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${COLLECTION}`;

type FirestoreValue =
  | { stringValue: string }
  | { timestampValue: string }
  | { nullValue: null };

type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
  createTime?: string;
  updateTime?: string;
};

type FirestoreListResponse = {
  documents?: FirestoreDocument[];
};

export type DiaryEntryPayload = {
  icon: string;
  title: string;
  body: string;
  date: string;
  imageUrl?: string;
};

function stringField(value: string): FirestoreValue {
  return { stringValue: value };
}

function timestampField(value: string): FirestoreValue {
  return { timestampValue: value };
}

function readString(
  fields: Record<string, FirestoreValue> | undefined,
  key: string,
  fallback = '',
) {
  const field = fields?.[key];
  if (field && 'stringValue' in field) return field.stringValue;
  if (field && 'timestampValue' in field) return field.timestampValue;
  return fallback;
}

function documentId(name: string) {
  return name.split('/').pop() ?? name;
}

function toEntry(document: FirestoreDocument): Entry {
  const createdAt = readString(
    document.fields,
    'createdAt',
    document.createTime ?? new Date().toISOString(),
  );
  const updatedAt = readString(
    document.fields,
    'updatedAt',
    document.updateTime ?? createdAt,
  );

  return {
    id: documentId(document.name),
    icon: readString(document.fields, 'icon', '📝'),
    title: readString(document.fields, 'title'),
    body: readString(document.fields, 'body'),
    date: readString(document.fields, 'date'),
    imageUrl: readString(document.fields, 'imageUrl') || undefined,
    createdAt,
    updatedAt,
  };
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const separator = url.includes('?') ? '&' : '?';
  const response = await fetch(`${url}${separator}key=${firebaseConfig.apiKey}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Firestore request failed: ${response.status} ${detail}`);
  }

  return response.json() as Promise<T>;
}

function createFields(
  input: DiaryEntryPayload,
  createdAt: string,
  updatedAt: string,
) {
  return {
    fields: {
      icon: stringField(input.icon),
      title: stringField(input.title),
      body: stringField(input.body),
      date: stringField(input.date),
      imageUrl: stringField(input.imageUrl ?? ''),
      createdAt: timestampField(createdAt),
      updatedAt: timestampField(updatedAt),
    },
  };
}

export async function fetchDiaryEntries() {
  const data = await request<FirestoreListResponse>(BASE_URL);
  return (data.documents ?? []).map(toEntry);
}

export async function createDiaryEntry(input: DiaryEntryPayload) {
  const now = new Date().toISOString();
  const document = await request<FirestoreDocument>(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(createFields(input, now, now)),
  });
  return toEntry(document);
}

export async function updateDiaryEntry(id: string, input: DiaryEntryPayload) {
  const existing = await request<FirestoreDocument>(`${BASE_URL}/${id}`);
  const createdAt = readString(
    existing.fields,
    'createdAt',
    existing.createTime ?? new Date().toISOString(),
  );
  const now = new Date().toISOString();
  const mask = [
    'icon',
    'title',
    'body',
    'date',
    'imageUrl',
    'createdAt',
    'updatedAt',
  ]
    .map((field) => `updateMask.fieldPaths=${field}`)
    .join('&');

  const document = await request<FirestoreDocument>(`${BASE_URL}/${id}?${mask}`, {
    method: 'PATCH',
    body: JSON.stringify(createFields(input, createdAt, now)),
  });
  return toEntry(document);
}
