const VIETNAM_ADDRESS_API_URL = "https://provinces.open-api.vn/api/v2";

export interface VietnamProvince {
  code: number;
  name: string;
  division_type: string;
  codename: string;
}

export interface VietnamWard {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  province_code: number;
}

async function getAddressData<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${VIETNAM_ADDRESS_API_URL}${path}`, { signal });

  if (!response.ok) {
    throw new Error(`Vietnam address API returned ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

export function getVietnamProvinces(signal?: AbortSignal) {
  return getAddressData<VietnamProvince[]>("/p/", signal);
}

export function getVietnamWards(provinceCode: number, signal?: AbortSignal) {
  return getAddressData<VietnamWard[]>(`/w/?province=${provinceCode}`, signal);
}
