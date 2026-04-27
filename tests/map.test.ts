import { describe, it, expect } from "vitest";
import { mapType, findMapping } from "../src/map.ts";

describe("type mappings", () => {
  it("maps integer family", () => {
    expect(mapType("integer")?.oracle).toBe("NUMBER(10)");
    expect(mapType("int")?.oracle).toBe("NUMBER(10)");
    expect(mapType("bigint")?.oracle).toBe("NUMBER(19)");
    expect(mapType("smallint")?.oracle).toBe("NUMBER(5)");
  });

  it("maps serial to GENERATED IDENTITY", () => {
    expect(mapType("serial")?.oracle).toContain("IDENTITY");
    expect(mapType("bigserial")?.oracle).toContain("IDENTITY");
  });

  it("is case-insensitive", () => {
    expect(mapType("BiGsErIaL")?.oracle).toContain("IDENTITY");
    expect(mapType("TEXT")?.oracle).toBe("CLOB");
    expect(mapType("Boolean")?.oracle).toBe("NUMBER(1)");
  });

  it("preserves length on varchar", () => {
    expect(mapType("varchar(255)")?.oracle).toBe("VARCHAR2(255)");
    expect(mapType("character varying(50)")?.oracle).toBe("VARCHAR2(50)");
  });

  it("warns loudly on unconstrained varchar", () => {
    const r = mapType("varchar");
    expect(r?.oracle).toBe("VARCHAR2(4000)");
    expect(r?.severity).toBe("high");
    expect(r?.warn).toMatch(/byte|char|NLS_LENGTH_SEMANTICS/i);
  });

  it("maps text → CLOB", () => {
    expect(mapType("text")?.oracle).toBe("CLOB");
  });

  it("maps boolean → NUMBER(1) with warning", () => {
    const r = mapType("boolean");
    expect(r?.oracle).toBe("NUMBER(1)");
    expect(r?.warn).toMatch(/true|false|1\/0/i);
  });

  it("maps timestamptz → TIMESTAMP WITH TIME ZONE", () => {
    expect(mapType("timestamptz")?.oracle).toBe("TIMESTAMP WITH TIME ZONE");
    expect(mapType("timestamp with time zone")?.oracle).toBe("TIMESTAMP WITH TIME ZONE");
  });

  it("maps uuid → RAW(16) with warning", () => {
    const r = mapType("uuid");
    expect(r?.oracle).toBe("RAW(16)");
    expect(r?.severity).toBe("warn");
  });

  it("maps bytea → BLOB", () => {
    expect(mapType("bytea")?.oracle).toBe("BLOB");
  });

  it("maps jsonb → CLOB IS JSON with HIGH severity", () => {
    const r = mapType("jsonb", "data");
    expect(r?.oracle).toContain("CLOB");
    expect(r?.oracle).toContain("IS JSON");
    expect(r?.oracle).toContain("data");
    expect(r?.severity).toBe("high");
  });

  it("maps numeric with precision", () => {
    expect(mapType("numeric(10,2)")?.oracle).toBe("NUMBER(10,2)");
  });

  it("maps real → BINARY_FLOAT", () => {
    expect(mapType("real")?.oracle).toBe("BINARY_FLOAT");
    expect(mapType("double precision")?.oracle).toBe("BINARY_DOUBLE");
  });

  it("returns null for unknown type", () => {
    expect(mapType("hstore")).toBeNull();
    expect(findMapping("xml")).toBeNull();
  });
});
