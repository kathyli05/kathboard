import React, { useState } from "react";

export default function PinGate({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setErr("");

    if (!/^\d{4}$/.test(pin)) {
      setErr("Enter a 4-digit PIN.");
      return;
    }

    sessionStorage.setItem("FT_PIN", pin);
    onUnlock();
  };

  const onPinChange = (e) => {
    // keep digits only + max 4
    const next = e.target.value.replace(/\D/g, "").slice(0, 4);
    setPin(next);
    if (err) setErr("");
  };

  return (
    <div className="pingate-page">
      <form onSubmit={submit} className="pingate-card">
        <div className="pingate-header">
          <div className="pingate-kicker">✦ Friend Tracker ✦</div>
          <h1 className="pingate-title">Enter PIN</h1>
          <p className="pingate-message">
            welcome to kathy&apos;s friend tracker. she has a very bad memory but
            cares about her friends a lot so this is her solution.
            <br />
            to prevent general creepiness, please enter the pin :)
          </p>
        </div>

        <label className="pingate-label" htmlFor="ft-pin">
          4-digit PIN
        </label>

        <input
          id="ft-pin"
          className="pingate-input"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          placeholder="••••"
          value={pin}
          onChange={onPinChange}
          maxLength={4}
          aria-invalid={Boolean(err)}
          aria-describedby={err ? "ft-pin-error" : undefined}
        />

        {err && (
          <div id="ft-pin-error" className="pingate-error" role="alert">
            {err}
          </div>
        )}

        <button className="pingate-button" type="submit">
          Unlock
        </button>

        <div className="pingate-hint">☾ Tip: it’s numbers only (4 digits)</div>
      </form>
    </div>
  );
}
