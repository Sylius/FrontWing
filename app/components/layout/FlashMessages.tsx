import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { IconX } from "@tabler/icons-react";

type FlashMessage = {
  id: string;
  type: "success" | "error" | "info" | "warning";
  content: string;
};

type Props = {
  messages: FlashMessage[];
  removeMessage: (id: string) => void;
};

const typeLabelKeys = {
  success: "flash.success",
  error: "flash.error",
  info: "flash.info",
  warning: "flash.warning",
} as const;

const FlashMessages: React.FC<Props> = ({ messages, removeMessage }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const timers = messages.map((msg) =>
        setTimeout(() => removeMessage(msg.id), 5000)
    );

    return () => timers.forEach(clearTimeout);
  }, [messages, removeMessage]);

  return (
      <div className="d-flex flex-column gap-2 container fixed-top mt-5">
        {messages.map((msg) => (
            <div
                className={`alert alert-${msg.type === "error" ? "danger" : msg.type} my-0`}
                role="alert"
                key={msg.id}
            >
              <div className="d-flex justify-content-between">
                <div className="fw-bold">{t(typeLabelKeys[msg.type])}</div>
                <span
                    className="close flash-message-close"
                    onClick={() => removeMessage(msg.id)}
                    aria-label={t("aria.close")}
                >
              <IconX stroke={2} />
            </span>
              </div>
              <div>{msg.content}</div>
            </div>
        ))}
      </div>
  );
};

export default FlashMessages;
