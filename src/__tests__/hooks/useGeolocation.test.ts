import { renderHook, act } from "@testing-library/react";
import { useGeolocation } from "@/hooks/useGeolocation";

const mockGetCurrentPosition = jest.fn();

beforeEach(() => {
  mockGetCurrentPosition.mockReset();
  Object.defineProperty(global.navigator, "geolocation", {
    value: { getCurrentPosition: mockGetCurrentPosition },
    writable: true,
    configurable: true,
  });
});

describe("useGeolocation", () => {
  it("starts with null position and no error", () => {
    const { result } = renderHook(() => useGeolocation());
    expect(result.current.position).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("sets loading to true when requestPosition is called", () => {
    mockGetCurrentPosition.mockImplementation(() => {});
    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestPosition();
    });

    expect(result.current.loading).toBe(true);
  });

  it("returns position on success", () => {
    mockGetCurrentPosition.mockImplementation((onSuccess) => {
      onSuccess({ coords: { latitude: 26.9124, longitude: 75.7873 } });
    });

    const { result } = renderHook(() => useGeolocation());
    act(() => {
      result.current.requestPosition();
    });

    expect(result.current.position).toEqual({
      latitude: 26.9124,
      longitude: 75.7873,
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets error on PERMISSION_DENIED", () => {
    mockGetCurrentPosition.mockImplementation((_onSuccess, onError) => {
      onError({ code: 1, PERMISSION_DENIED: 1 });
    });

    const { result } = renderHook(() => useGeolocation());
    act(() => {
      result.current.requestPosition();
    });

    expect(result.current.error).toContain("permission denied");
    expect(result.current.loading).toBe(false);
  });

  it("sets error on POSITION_UNAVAILABLE", () => {
    mockGetCurrentPosition.mockImplementation((_onSuccess, onError) => {
      onError({ code: 2, POSITION_UNAVAILABLE: 2 });
    });

    const { result } = renderHook(() => useGeolocation());
    act(() => {
      result.current.requestPosition();
    });

    expect(result.current.error).toContain("unavailable");
    expect(result.current.loading).toBe(false);
  });

  it("sets error on TIMEOUT", () => {
    mockGetCurrentPosition.mockImplementation((_onSuccess, onError) => {
      onError({ code: 3, TIMEOUT: 3 });
    });

    const { result } = renderHook(() => useGeolocation());
    act(() => {
      result.current.requestPosition();
    });

    expect(result.current.error).toContain("timed out");
    expect(result.current.loading).toBe(false);
  });

  it("sets error when geolocation not supported", () => {
    Object.defineProperty(global.navigator, "geolocation", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocation());
    act(() => {
      result.current.requestPosition();
    });

    expect(result.current.error).toContain("not supported");
    expect(result.current.loading).toBe(false);
  });
});
