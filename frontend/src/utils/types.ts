export type ObjType = 'organization' | 'news' | 'event' | 'person' | 'initiative';
export type ObjSphere = 'governance' | 'social' | 'infrastructure' | 'environment';
export type UserRole = 'guest' | 'registered' | 'activist' | 'admin' | 'superadmin';

export interface Mun {
  mun_id: string;
  mun_country: string;
  mun_region: string;
  mun_name: string;
  mun_coordinates: { lat: number; lng: number } | null;
}

export interface Obj {
  obj_id: string;
  obj_mun: string;
  obj_type: ObjType;
  obj_sphere: ObjSphere;
  obj_title: string;
  obj_description: string | null;
  obj_photo: string | null;
  obj_date: string;
  obj_author: string | null;
  obj_coordinates: { lat: number; lng: number } | null;
  obj_likes: string[];
  obj_dislikes: string[];
  obj_reports: string[];
  obj_sort_order: number;
}

export interface AppUser {
  user_id: string;
  user_name: string;
  user_email: string;
  user_mun: string | null;
  user_role: UserRole;
  user_premium: boolean;
}

export interface Comm {
  comm_id: string;
  comm_obj: string;
  comm_author: string;
  comm_text: string;
  comm_date: string;
  comm_likes: string[];
  comm_dislikes: string[];
  comm_reports: string[];
}

export interface Doc {
  doc_id: string;
  doc_mun: string;
  doc_author: string;
  doc_title: string;
  doc_url: string;
  doc_date: string;
}

export interface Config {
  config_id: string;
  config_key: string;
  config_value: string;
}

export interface ListFilter {
  title: string;
  type?: ObjType;
  sphere?: ObjSphere;
}

export interface MapOptions {
  selectMode?: boolean;
  onSelect?: (coords: { lat: number; lng: number }) => void;
}
