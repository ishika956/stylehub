import React from "react";
import { passwordRules } from "../utils/validatePassword";

const PasswordChecklist = ({ password }) => (
  <ul className="mt-2 space-y-1">
    {passwordRules.map((rule) => {
      const ok = rule.test(password);
      return (
        <li key={rule.label} className={`text-xs flex items-center gap-1.5 ${ok ? "text-moss" : "text-ink/40"}`}>
          <span>{ok ? "✓" : "○"}</span> {rule.label}
        </li>
      );
    })}
  </ul>
);

export default PasswordChecklist;