import { useEffect, useMemo, useState } from "react";

import { useAppContext } from "../app/app-context";
import { Button } from "../shared/ui/button";
import { PageTopBar } from "../shared/ui/page-top-bar";
import { SectionCard } from "../shared/ui/section-card";
import { Surface } from "../shared/ui/surface";

const terminalStatuses = new Set(["ended", "rejected", "missed"]);
const activeStatuses = new Set(["requested", "accepted", "in_progress", "ringing"]);

export function CallsPage() {
  const { data, sessionUser, startCall, updateCallStatus, refreshData } = useAppContext();
  const [startingCallId, setStartingCallId] = useState<string>("");
  const [updatingCallId, setUpdatingCallId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const sortedCalls = useMemo(
    () => [...data.calls].sort((left, right) => right.startedAt.localeCompare(left.startedAt)),
    [data.calls],
  );

  const chatPeers = useMemo(
    () =>
      data.chats
        .map((chat) => {
          const peerId = chat.participantIds.find((id) => id !== sessionUser?.id) ?? "";
          return {
            chatId: chat.id,
            peerId,
            peerName: chat.participantNames[peerId] ?? "Собеседник",
          };
        })
        .filter((item) => item.peerId),
    [data.chats, sessionUser?.id],
  );

  const peerNameByChatId = useMemo(() => {
    const map = new Map<string, string>();
    for (const chat of data.chats) {
      const peerId = chat.participantIds.find((id) => id !== sessionUser?.id);
      if (peerId) {
        map.set(chat.id, chat.participantNames[peerId] ?? "Собеседник");
      }
    }
    return map;
  }, [data.chats, sessionUser?.id]);

  useEffect(() => {
    void refreshData();
    const interval = window.setInterval(() => {
      void refreshData();
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [refreshData]);

  async function handleStartCall(chatId: string, participantId: string) {
    try {
      setError(null);
      setStartingCallId(chatId);
      await startCall(participantId, chatId, "Interview call");
      await refreshData();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to start call.");
    } finally {
      setStartingCallId("");
    }
  }

  async function handleUpdateCall(callId: string, status: string, summary?: string) {
    try {
      setError(null);
      setUpdatingCallId(callId);
      await updateCallStatus(callId, status, summary);
      await refreshData();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to update call status.");
    } finally {
      setUpdatingCallId("");
    }
  }

  return (
    <div className="page-enter space-y-6">
      <PageTopBar
        title="Звонки"
        subtitle="Входящие и исходящие звонки синхронизируются через backend API в реальном времени с периодическим обновлением."
      />

      {error ? <Surface subtitle={error} className="border-rose-500/50" /> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <SectionCard title="История звонков" eyebrow="/api/v1/calls">
          <div className="space-y-3">
            {sortedCalls.length === 0 ? (
              <Surface subtitle="История звонков пуста." />
            ) : (
              sortedCalls.map((call) => {
                const peerId = call.initiatedBy === sessionUser?.id ? call.participantId : call.initiatedBy;
                const peer = data.users.find((item) => item.id === peerId);
                const fallbackPeerName = call.chatId ? peerNameByChatId.get(call.chatId) : undefined;
                const isIncoming = call.participantId === sessionUser?.id && call.status === "requested";

                return (
                  <Surface
                    key={call.id}
                    title={peer?.fullName ?? fallbackPeerName ?? "Собеседник"}
                    subtitle={`Статус: ${call.status} • ${call.durationSeconds} сек`}
                    badge={call.chatId ? `chat ${call.chatId.slice(0, 8)}` : "no chat"}
                    action={
                      <div className="flex flex-wrap gap-2">
                        {isIncoming ? (
                          <>
                            <Button
                              variant="secondary"
                              onClick={() => void handleUpdateCall(call.id, "accepted")}
                              disabled={updatingCallId === call.id}
                            >
                              {updatingCallId === call.id ? "Сохраняем..." : "Принять"}
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => void handleUpdateCall(call.id, "rejected", "Call rejected from UI")}
                              disabled={updatingCallId === call.id}
                            >
                              {updatingCallId === call.id ? "Сохраняем..." : "Отклонить"}
                            </Button>
                          </>
                        ) : null}
                        {activeStatuses.has(call.status) ? (
                          <Button
                            variant="secondary"
                            onClick={() => void handleUpdateCall(call.id, "ended", "Call finished from UI")}
                            disabled={updatingCallId === call.id}
                          >
                            {updatingCallId === call.id ? "Сохраняем..." : "Завершить"}
                          </Button>
                        ) : null}
                        {terminalStatuses.has(call.status) ? null : null}
                      </div>
                    }
                  >
                    <p className="text-sm text-secondary">{call.summary || "Summary пока не заполнен."}</p>
                  </Surface>
                );
              })
            )}
          </div>
        </SectionCard>

        <SectionCard title="Быстрый старт" eyebrow="Звонок из чата">
          <div className="space-y-3">
            {chatPeers.length === 0 ? (
              <Surface subtitle="Нет чатов для старта звонка." />
            ) : (
              chatPeers.map((item) => (
                <Surface
                  key={item.chatId}
                  title={item.peerName}
                  subtitle={`Chat: ${item.chatId.slice(0, 8)}`}
                  action={
                    <Button
                      onClick={() => void handleStartCall(item.chatId, item.peerId)}
                      disabled={startingCallId === item.chatId}
                    >
                      {startingCallId === item.chatId ? "Запуск..." : "Позвонить"}
                    </Button>
                  }
                />
              ))
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
