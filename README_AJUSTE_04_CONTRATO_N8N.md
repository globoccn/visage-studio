# Ajuste 04 — Contrato Frontend x n8n

Validação feita contra os workflows n8n v1.123.21.

## Problema encontrado

O frontend carregava `/fleury-history` antes de `/fleury-dashboard-latest`. Se o workflow de histórico retornasse corpo vazio, a carga inteira caía no `catch`, impedindo o dashboard em Redis de carregar.

Também havia diferença de contrato no dashboard: o workflow enviava `reading_time`, enquanto o frontend usa `timestamp` em vários componentes.

## Ajustes feitos no frontend

- Dashboard e histórico agora carregam de forma independente.
- Falha no histórico não bloqueia o dashboard em tempo real.
- Normalização de payloads do n8n:
  - `records`, `data`, `history` ou array direto.
  - `reading_time` passa a alimentar `timestamp`.
  - campos numéricos são normalizados para `number | null`.
- O histórico agora é filtrado no frontend conforme período selecionado.
- O frontend tolera o workflow `/fleury-history` retornando até 30 dias fixos.

## Contrato esperado

### GET /fleury-dashboard-latest

```json
{
  "ok": true,
  "updatedAt": "2026-07-02T23:00:00.000Z",
  "refreshSeconds": 300,
  "expectedSensors": 15,
  "sensorsOnline": 10,
  "sensors": [],
  "alarms": [],
  "kpis": {}
}
```

### GET /fleury-history

```json
{
  "ok": true,
  "count": 0,
  "records": []
}
```

### GET /fleury-settings

```json
{
  "ok": true,
  "settings": {
    "temperature_low": 21.5,
    "temperature_high": 25,
    "humidity_low": 35,
    "humidity_high": 65,
    "co2_low": 400,
    "co2_high": 1000
  }
}
```
