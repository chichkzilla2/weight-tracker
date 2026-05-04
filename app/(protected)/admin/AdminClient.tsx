"use client";

import {
  type FormEvent,
  useState,
  useActionState,
  useEffect,
  useMemo,
  useTransition,
} from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  createUser,
  deleteUser,
  createGroup,
  deleteGroup,
  changeUserGroup,
  updateGroupName,
  changeUserPasswordByAdmin,
  updateUserRealName,
  createWeightRecordByAdmin,
  updateWeightRecordByAdmin,
  createWaistRecordByAdmin,
  updateWaistRecordByAdmin,
} from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatThaiDate, THAI_MONTHS, toThaiYear } from "@/lib/calculations";
import {
  AlertTriangle,
  Info,
  KeyRound,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import AppModal from "@/components/shared/AppModal";
import {
  AdminGroupsSkeleton,
  AdminUsersSkeleton,
} from "@/components/shared/TableSkeleton";
import { GlassSelect } from "@/components/shared/GlassSelect";

interface UserData {
  id: string;
  username: string;
  realName: string;
  firstName: string;
  lastName: string;
  role: string;
  groupId: string;
  groupName: string;
  createdAt: string;
  weightEntries: { id: string; weight: number; recordedAt: string }[];
  waistEntries: { id: string; waist: number; recordedAt: string }[];
}

interface GroupData {
  id: string;
  name: string;
  memberCount: number;
  createdAt: string;
}

const GROUP_CAPACITY = 10;
const CHALLENGE_START_YEAR = 2026;
const CHALLENGE_START_MONTH = 3; // April, zero-based

function formatDateInput(value: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function todayDateInput() {
  return formatDateInput(new Date().toISOString());
}

function formatThaiMonthKey(value: string) {
  return formatDateInput(value).slice(0, 7);
}

function formatMonthDateValue(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-01`;
}

function buildChallengeMonths() {
  const [currentYearValue, currentMonthValue] = todayDateInput().split("-");
  const currentYear = Number(currentYearValue);
  const currentMonth = Number(currentMonthValue) - 1;
  const months: { key: string; dateValue: string; label: string }[] = [];

  for (let year = CHALLENGE_START_YEAR; year <= currentYear; year++) {
    const startMonth =
      year === CHALLENGE_START_YEAR ? CHALLENGE_START_MONTH : 0;
    const endMonth = year === currentYear ? currentMonth : 11;

    for (let month = startMonth; month <= endMonth; month++) {
      const dateValue = formatMonthDateValue(year, month);
      months.push({
        key: dateValue.slice(0, 7),
        dateValue,
        label: `${THAI_MONTHS[month]} ${toThaiYear(year)}`,
      });
    }
  }

  return months.reverse();
}

interface AdminClientProps {
  users: UserData[];
  groups: GroupData[];
}

type Tab = "users" | "groups";
type DetailUser = UserData;

type DialogState =
  | {
      type: "saveGroups";
      changes: {
        userId: string;
        userName: string;
        oldGroupName: string;
        newGroupName: string;
      }[];
    }
  | { type: "deleteUser"; userId: string; userName: string }
  | { type: "deleteGroup"; groupId: string; groupName: string }
  | { type: "editGroup"; groupId: string; groupName: string }
  | { type: "editUserName"; userId: string; userName: string }
  | { type: "changePassword"; userId: string; userName: string }
  | null;

const initialUserState = { error: "", success: false };
const initialGroupState = { error: "", success: false };

export default function AdminClient({ users, groups }: AdminClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("users");
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [tabPending, startTabTransition] = useTransition();
  const [showUserForm, setShowUserForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editGroupName, setEditGroupName] = useState("");
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [userSearch, setUserSearch] = useState("");
  const [userGroupFilter, setUserGroupFilter] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [dialog, setDialog] = useState<DialogState>(null);
  const [confirming, setConfirming] = useState(false);
  const [detailUser, setDetailUser] = useState<DetailUser | null>(null);
  const [passwordUser, setPasswordUser] = useState<DetailUser | null>(null);
  const [recordUser, setRecordUser] = useState<DetailUser | null>(null);
  const [detailFirstName, setDetailFirstName] = useState("");
  const [detailLastName, setDetailLastName] = useState("");
  const [detailGroupId, setDetailGroupId] = useState("");
  const [detailPassword, setDetailPassword] = useState("");
  const [detailPasswordConfirm, setDetailPasswordConfirm] = useState("");
  const [detailSaving, setDetailSaving] = useState(false);
  const [recordSaving, setRecordSaving] = useState(false);

  const [userGroupSelections, setUserGroupSelections] = useState<
    Record<string, string>
  >(() => Object.fromEntries(users.map((u) => [u.id, u.groupId ?? ""])));
  const [userState, userFormAction, userPending] = useActionState(
    createUser,
    initialUserState,
  );
  const [groupState, groupFormAction, groupPending] = useActionState(
    createGroup,
    initialGroupState,
  );

  useEffect(() => {
    if (userState.success) toast.success("เพิ่มผู้ใช้เรียบร้อย");
    else if (userState.error) toast.error(userState.error);
  }, [userState]);

  useEffect(() => {
    if (groupState.success) toast.success("เพิ่มกลุ่มเรียบร้อย");
    else if (groupState.error) toast.error(groupState.error);
  }, [groupState]);

  const filteredUsers = useMemo(
    () =>
      users.filter((u) => {
        const q = userSearch.toLowerCase();
        if (
          q &&
          !u.realName.toLowerCase().includes(q) &&
          !u.username.toLowerCase().includes(q)
        )
          return false;
        if (userGroupFilter && (u.groupId || "") !== userGroupFilter)
          return false;
        return true;
      }),
    [users, userSearch, userGroupFilter],
  );

  const filteredGroups = useMemo(
    () =>
      groups.filter(
        (g) =>
          groupSearch === "" ||
          g.name.toLowerCase().includes(groupSearch.toLowerCase()),
      ),
    [groups, groupSearch],
  );

  const pendingGroupChanges = useMemo(
    () =>
      users
        .filter(
          (u) =>
            (userGroupSelections[u.id] ?? u.groupId ?? "") !==
            (u.groupId ?? ""),
        )
        .map((u) => ({
          userId: u.id,
          userName: u.realName,
          oldGroupName: u.groupName,
          newGroupName:
            groups.find((g) => g.id === userGroupSelections[u.id])?.name ??
            "ไม่มีกลุ่ม",
        })),
    [users, groups, userGroupSelections],
  );

  const detailChanged =
    !!detailUser &&
    (detailFirstName.trim() !== detailUser.firstName ||
      detailLastName.trim() !== detailUser.lastName ||
      detailGroupId !== (detailUser.groupId ?? ""));

  function openUserDetail(user: UserData) {
    setDetailUser(user);
    setDetailFirstName(user.firstName);
    setDetailLastName(user.lastName);
    setDetailGroupId(user.groupId ?? "");
  }

  async function handleSaveUserDetail() {
    if (!detailUser || !detailChanged) return;
    setDetailSaving(true);

    try {
      const nameChanged =
        detailFirstName.trim() !== detailUser.firstName ||
        detailLastName.trim() !== detailUser.lastName;
      const groupChanged = detailGroupId !== (detailUser.groupId ?? "");

      if (nameChanged) {
        const result = await updateUserRealName(
          detailUser.id,
          detailFirstName,
          detailLastName,
        );
        if (result.error) {
          toast.error(result.error);
          setDetailSaving(false);
          return;
        }
      }

      if (groupChanged) {
        const result = await changeUserGroup(detailUser.id, detailGroupId);
        if (result.error) {
          toast.error(result.error);
          setDetailSaving(false);
          return;
        }
      }

      const nextGroupName =
        groups.find((g) => g.id === detailGroupId)?.name ?? "ไม่มีกลุ่ม";
      setDetailUser({
        ...detailUser,
        realName: [detailFirstName.trim(), detailLastName.trim()]
          .filter(Boolean)
          .join(" "),
        firstName: detailFirstName.trim(),
        lastName: detailLastName.trim(),
        groupId: detailGroupId,
        groupName: nextGroupName,
      });
      toast.success("บันทึกข้อมูลผู้ใช้เรียบร้อย");
      router.refresh();
    } catch {
      toast.error("บันทึกข้อมูลผู้ใช้ไม่สำเร็จ");
    } finally {
      setDetailSaving(false);
    }
  }

  function openPasswordDialog(user: UserData) {
    setPasswordUser(user);
    setDetailPassword("");
    setDetailPasswordConfirm("");
    setPasswordError("");
  }

  async function handleSavePassword() {
    if (!passwordUser) return;
    if (detailPassword.length < 6) {
      setPasswordError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (detailPassword !== detailPasswordConfirm) {
      setPasswordError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setDetailSaving(true);
    try {
      const result = await changeUserPasswordByAdmin(
        passwordUser.id,
        detailPassword,
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`เปลี่ยนรหัสผ่านของ ${passwordUser.realName} เรียบร้อย`);
      setPasswordUser(null);
      setDetailPassword("");
      setDetailPasswordConfirm("");
      setPasswordError("");
      router.refresh();
    } catch {
      toast.error("เปลี่ยนรหัสผ่านไม่สำเร็จ");
    } finally {
      setDetailSaving(false);
    }
  }

  async function handleCreateWeightRecord(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!recordUser) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    setRecordSaving(true);
    try {
      const result = await createWeightRecordByAdmin(
        recordUser.id,
        String(formData.get("weight") ?? ""),
        String(formData.get("recordedAt") ?? ""),
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.entry) {
        setRecordUser({
          ...recordUser,
          weightEntries: [
            result.entry,
            ...recordUser.weightEntries.filter(
              (entry) => entry.id !== result.entry?.id,
            ),
          ],
        });
      }
      form.reset();
      toast.success("เพิ่มข้อมูลน้ำหนักเรียบร้อย");
      router.refresh();
    } catch {
      toast.error("เพิ่มข้อมูลน้ำหนักไม่สำเร็จ");
    } finally {
      setRecordSaving(false);
    }
  }

  async function handleUpdateWeightRecord(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!recordUser) return;
    const formData = new FormData(e.currentTarget);
    const entryId = String(formData.get("entryId") ?? "");
    const weight = String(formData.get("weight") ?? "");
    const recordedAt = String(formData.get("recordedAt") ?? "");
    setRecordSaving(true);
    try {
      const result = await updateWeightRecordByAdmin(
        entryId,
        weight,
        recordedAt,
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setRecordUser({
        ...recordUser,
        weightEntries: recordUser.weightEntries.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                weight: Number(weight),
                recordedAt: new Date(
                  `${recordedAt}T00:00:00+07:00`,
                ).toISOString(),
              }
            : entry,
        ),
      });
      toast.success("แก้ไขข้อมูลน้ำหนักเรียบร้อย");
      router.refresh();
    } catch {
      toast.error("แก้ไขข้อมูลน้ำหนักไม่สำเร็จ");
    } finally {
      setRecordSaving(false);
    }
  }

  async function handleCreateWaistRecord(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!recordUser) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    setRecordSaving(true);
    try {
      const result = await createWaistRecordByAdmin(
        recordUser.id,
        String(formData.get("waist") ?? ""),
        String(formData.get("recordedAt") ?? ""),
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.entry) {
        setRecordUser({
          ...recordUser,
          waistEntries: [
            result.entry,
            ...recordUser.waistEntries.filter(
              (entry) => entry.id !== result.entry?.id,
            ),
          ],
        });
      }
      form.reset();
      toast.success("เพิ่มข้อมูลรอบเอวเรียบร้อย");
      router.refresh();
    } catch {
      toast.error("เพิ่มข้อมูลรอบเอวไม่สำเร็จ");
    } finally {
      setRecordSaving(false);
    }
  }

  async function handleUpdateWaistRecord(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!recordUser) return;
    const formData = new FormData(e.currentTarget);
    const entryId = String(formData.get("entryId") ?? "");
    const waist = String(formData.get("waist") ?? "");
    const recordedAt = String(formData.get("recordedAt") ?? "");
    setRecordSaving(true);
    try {
      const result = await updateWaistRecordByAdmin(entryId, waist, recordedAt);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setRecordUser({
        ...recordUser,
        waistEntries: recordUser.waistEntries.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                waist: Number(waist),
                recordedAt: new Date(
                  `${recordedAt}T00:00:00+07:00`,
                ).toISOString(),
              }
            : entry,
        ),
      });
      toast.success("แก้ไขข้อมูลรอบเอวเรียบร้อย");
      router.refresh();
    } catch {
      toast.error("แก้ไขข้อมูลรอบเอวไม่สำเร็จ");
    } finally {
      setRecordSaving(false);
    }
  }

  async function handleConfirm() {
    if (!dialog) return;
    setConfirming(true);

    if (dialog.type === "saveGroups") {
      const results = await Promise.all(
        dialog.changes.map((c) =>
          changeUserGroup(c.userId, userGroupSelections[c.userId] ?? c.userId),
        ),
      );
      const failed = results.filter((r) => r.error);
      if (failed.length > 0) toast.error(failed[0]?.error ?? "เกิดข้อผิดพลาด");
      else
        toast.success(
          `บันทึกการเปลี่ยนกลุ่มเรียบร้อย (${dialog.changes.length} รายการ)`,
        );
    }

    if (dialog.type === "deleteUser") {
      try {
        const result = await deleteUser(dialog.userId);
        if (result.error) toast.error(result.error);
        else toast.success(`ลบผู้ใช้ ${dialog.userName} เรียบร้อย`);
      } catch {
        toast.error("ลบผู้ใช้ไม่สำเร็จ");
      }
    }

    if (dialog.type === "deleteGroup") {
      const result = await deleteGroup(dialog.groupId);
      if (result.error) toast.error(result.error);
      else toast.success(`ลบกลุ่ม ${dialog.groupName} เรียบร้อย`);
    }

    if (dialog.type === "editGroup") {
      const result = await updateGroupName(dialog.groupId, editGroupName);
      if (result.error) {
        toast.error(result.error);
        setConfirming(false);
        return;
      }
      toast.success("แก้ไขชื่อกลุ่มเรียบร้อย");
    }

    if (dialog.type === "editUserName") {
      const result = await updateUserRealName(
        dialog.userId,
        editFirstName,
        editLastName,
      );
      if (result.error) {
        toast.error(result.error);
        setConfirming(false);
        return;
      }
      toast.success("แก้ไขชื่อเรียบร้อย");
    }

    if (dialog.type === "changePassword") {
      if (newPassword.length < 6) {
        setPasswordError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
        setConfirming(false);
        return;
      }
      const result = await changeUserPasswordByAdmin(
        dialog.userId,
        newPassword,
      );
      if (result.error) {
        toast.error(result.error);
        setConfirming(false);
        return;
      }
      toast.success(`เปลี่ยนรหัสผ่านของ ${dialog.userName} เรียบร้อย`);
      setNewPassword("");
      setPasswordError("");
    }

    setConfirming(false);
    setDialog(null);
  }

  const tabs = [
    { key: "users" as Tab, label: "จัดการผู้ใช้" },
    { key: "groups" as Tab, label: "จัดการกลุ่ม" },
  ];
  const tabIndex = tabs.findIndex((t) => t.key === activeTab);
  const DialogIcon =
    dialog?.type === "deleteUser" || dialog?.type === "deleteGroup"
      ? Trash2
      : dialog?.type === "saveGroups"
        ? AlertTriangle
        : dialog?.type === "changePassword"
          ? KeyRound
          : dialog?.type === "editGroup" || dialog?.type === "editUserName"
            ? Pencil
            : Info;
  const dialogIconClass =
    dialog?.type === "deleteUser" || dialog?.type === "deleteGroup"
      ? "bg-[#8A3F3F]/20 text-[#D08A8A]"
      : "bg-[#F59E0B]/15 text-[#F59E0B]";
  const challengeMonths = useMemo(buildChallengeMonths, []);
  const weightEntriesByMonth = new Map(
    (recordUser?.weightEntries ?? []).map((entry) => [
      formatThaiMonthKey(entry.recordedAt),
      entry,
    ]),
  );
  const waistEntriesByMonth = new Map(
    (recordUser?.waistEntries ?? []).map((entry) => [
      formatThaiMonthKey(entry.recordedAt),
      entry,
    ]),
  );

  return (
    <div>
      {/* User Detail Dialog */}
      <AppModal
        open={detailUser !== null}
        onClose={() => {
          if (!detailSaving) setDetailUser(null);
        }}
        backdropColor="rgba(0,0,0,0.55)"
      >
        {detailUser && (
          <div className="fixed bottom-0 left-0 right-0 rounded-t-2xl bg-[rgb(23,26,32)] shadow-2xl w-full max-h-[65vh] overflow-y-auto p-5 outline-none border border-white/10 animate-in slide-in-from-bottom-6 duration-200 sm:slide-in-from-bottom-0 sm:zoom-in-95 sm:absolute sm:top-1/2 sm:left-1/2 sm:bottom-auto sm:right-auto sm:max-h-[90vh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:w-[calc(100%-2rem)] sm:max-w-md">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#F59E0B]/15 text-[#F59E0B]">
              <Info size={23} />
            </div>
            <div className="mb-6 text-center">
              <h3 className="font-bold text-[#E7EAF0] text-lg">
                รายละเอียดผู้ใช้
              </h3>
              <p className="text-xs text-[#A8AFBD] mt-1">
                {detailUser.realName}
              </p>
            </div>

            <div className="mb-6 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-[#0F1115]/55 px-3 py-2">
                  <p className="text-[11px] text-[#A8AFBD]">user_id</p>
                  <p className="text-xs font-medium text-[#E7EAF0] break-all">
                    {detailUser.id}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0F1115]/55 px-3 py-2">
                  <p className="text-[11px] text-[#A8AFBD]">role</p>
                  <p className="text-xs font-medium text-[#E7EAF0]">
                    {detailUser.role}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-[#F59E0B]">
                  ชื่อจริง (first name)
                </Label>
                <Input
                  value={detailFirstName}
                  onChange={(e) => setDetailFirstName(e.target.value)}
                  className="border-white/10 rounded-xl text-sm"
                />
              </div>

              {detailUser.lastName && (
                <div className="space-y-1">
                  <Label className="text-xs text-[#F59E0B]">
                    นามสกุล (last name)
                  </Label>
                  <Input
                    value={detailLastName}
                    onChange={(e) => setDetailLastName(e.target.value)}
                    className="border-white/10 rounded-xl text-sm"
                  />
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs text-[#F59E0B]">กลุ่ม</Label>
                <GlassSelect
                  value={detailGroupId}
                  onChange={setDetailGroupId}
                  options={[
                    { value: "", label: "ไม่มีกลุ่ม" },
                    ...groups.map((g) => {
                      const remaining = GROUP_CAPACITY - g.memberCount;
                      const isFull = remaining === 0;
                      const isCurrentGroup =
                        g.id === (detailUser.groupId || "");
                      return {
                        value: g.id,
                        label: `${g.name} ${isFull ? "(เต็มแล้ว)" : `(ว่าง ${remaining} ที่)`}`,
                        disabled: isFull && !isCurrentGroup,
                      };
                    }),
                  ]}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setDetailUser(null)}
                  disabled={detailSaving}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-white/10 text-[#A8AFBD] hover:bg-[#1A1D23]/70 transition-colors disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => {
                    setDetailUser(null);
                    setDialog({
                      type: "deleteUser",
                      userId: detailUser.id,
                      userName: detailUser.realName,
                    });
                  }}
                  disabled={detailSaving}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-[#7A3434] hover:bg-[#5F2727] text-white transition-colors disabled:opacity-50"
                >
                  ลบ
                </button>
                <button
                  onClick={handleSaveUserDetail}
                  disabled={!detailChanged || detailSaving}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-[#F59E0B] hover:bg-[#D97706] text-[#111318] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {detailSaving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AppModal>

      {/* Password Dialog */}
      <AppModal
        open={passwordUser !== null}
        onClose={() => {
          if (!detailSaving) setPasswordUser(null);
        }}
        backdropColor="rgba(0,0,0,0.55)"
      >
        {passwordUser && (
          <div className="fixed bottom-0 left-0 right-0 rounded-t-2xl bg-[rgb(23,26,32)] shadow-2xl w-full max-h-[65vh] overflow-y-auto p-5 outline-none border border-white/10 animate-in slide-in-from-bottom-6 duration-200 sm:slide-in-from-bottom-0 sm:zoom-in-95 sm:absolute sm:top-1/2 sm:left-1/2 sm:bottom-auto sm:right-auto sm:max-h-[90vh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:w-[calc(100%-2rem)] sm:max-w-sm">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#F59E0B]/15 text-[#F59E0B]">
              <KeyRound size={23} />
            </div>
            <div className="mb-6 text-center">
              <h3 className="font-bold text-[#E7EAF0] text-lg">
                แก้ไขรหัสผ่าน
              </h3>
              <p className="text-xs text-[#A8AFBD] mt-1">
                {passwordUser.realName}
              </p>
            </div>
            <div className="mb-6 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-[#F59E0B]">รหัสผ่านใหม่</Label>
                <Input
                  type="password"
                  value={detailPassword}
                  onChange={(e) => {
                    setDetailPassword(e.target.value);
                    setPasswordError("");
                  }}
                  className="border-white/10 rounded-xl text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[#F59E0B]">ยืนยันรหัสผ่าน</Label>
                <Input
                  type="password"
                  value={detailPasswordConfirm}
                  onChange={(e) => {
                    setDetailPasswordConfirm(e.target.value);
                    setPasswordError("");
                  }}
                  className="border-white/10 rounded-xl text-sm"
                />
              </div>
              {passwordError && (
                <p className="text-[#D08A8A] text-xs">{passwordError}</p>
              )}
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setPasswordUser(null)}
                disabled={detailSaving}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-white/10 text-[#A8AFBD] hover:bg-[#1A1D23]/70 transition-colors disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSavePassword}
                disabled={detailSaving}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-[#F59E0B] hover:bg-[#D97706] text-[#111318] transition-colors disabled:opacity-40"
              >
                {detailSaving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        )}
      </AppModal>

      {/* Weight/Waist Records Dialog */}
      <AppModal
        open={recordUser !== null}
        onClose={() => {
          if (!recordSaving) setRecordUser(null);
        }}
        backdropColor="rgba(0,0,0,0.55)"
      >
        {recordUser && (
          <div className="fixed bottom-0 left-0 right-0 rounded-t-2xl bg-[rgb(23,26,32)] shadow-2xl w-full max-h-[65vh] overflow-y-auto p-5 outline-none border border-white/10 animate-in slide-in-from-bottom-6 duration-200 sm:slide-in-from-bottom-0 sm:zoom-in-95 sm:absolute sm:top-1/2 sm:left-1/2 sm:bottom-auto sm:right-auto sm:max-h-[90vh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:w-[calc(100%-2rem)] sm:max-w-md">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#F59E0B]/15 text-[#F59E0B]">
              <Pencil size={23} />
            </div>
            <div className="mb-6 text-center">
              <h3 className="font-bold text-[#E7EAF0] text-lg">
                แก้ไขน้ำหนัก/รอบเอว
              </h3>
              <p className="text-xs text-[#A8AFBD] mt-1">
                {recordUser.realName}
              </p>
            </div>
            <div className="mb-6 space-y-4">
              <div className="space-y-3 rounded-xl border border-white/10 bg-[#0F1115]/45 p-3">
                <p className="text-sm font-semibold text-[#F59E0B]">
                  ข้อมูลน้ำหนัก
                </p>
                <div className="space-y-8">
                  {challengeMonths.map((month) => {
                    const entry = weightEntriesByMonth.get(month.key);
                    return (
                      <form
                        key={month.key}
                        onSubmit={
                          entry
                            ? handleUpdateWeightRecord
                            : handleCreateWeightRecord
                        }
                        className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]"
                      >
                        {entry && (
                          <input
                            type="hidden"
                            name="entryId"
                            value={entry.id}
                          />
                        )}
                        <Input
                          name="weight"
                          type="number"
                          step="0.1"
                          min="0"
                          defaultValue={entry?.weight ?? ""}
                          placeholder="น้ำหนัก"
                          required
                          className="border-white/10 rounded-xl text-sm"
                        />
                        <input
                          type="hidden"
                          name="recordedAt"
                          value={
                            entry
                              ? formatDateInput(entry.recordedAt)
                              : month.dateValue
                          }
                        />
                        <div className="rounded-xl border border-white/10 bg-[#171A20]/70 px-3 py-2 text-sm text-[#E7EAF0]">
                          {month.label}
                        </div>
                        <button
                          type="submit"
                          disabled={recordSaving}
                          className={
                            entry
                              ? "rounded-xl border border-[#F59E0B]/25 px-3 py-2 text-sm font-medium text-[#F59E0B] disabled:opacity-50"
                              : "rounded-xl bg-[#F59E0B] px-3 py-2 text-sm font-medium text-[#111318] disabled:opacity-50"
                          }
                        >
                          {entry ? "แก้ไข" : "เพิ่ม"}
                        </button>
                      </form>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-3 rounded-xl border border-white/10 bg-[#0F1115]/45 p-3">
                <p className="text-sm font-semibold text-[#F59E0B]">
                  ข้อมูลรอบเอว
                </p>
                <div className="space-y-8">
                  {challengeMonths.map((month) => {
                    const entry = waistEntriesByMonth.get(month.key);
                    return (
                      <form
                        key={month.key}
                        onSubmit={
                          entry
                            ? handleUpdateWaistRecord
                            : handleCreateWaistRecord
                        }
                        className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]"
                      >
                        {entry && (
                          <input
                            type="hidden"
                            name="entryId"
                            value={entry.id}
                          />
                        )}
                        <Input
                          name="waist"
                          type="number"
                          step="0.1"
                          min="0"
                          defaultValue={entry?.waist ?? ""}
                          placeholder="รอบเอว"
                          required
                          className="border-white/10 rounded-xl text-sm"
                        />
                        <input
                          type="hidden"
                          name="recordedAt"
                          value={
                            entry
                              ? formatDateInput(entry.recordedAt)
                              : month.dateValue
                          }
                        />
                        <div className="rounded-xl border border-white/10 bg-[#171A20]/70 px-3 py-2 text-sm text-[#E7EAF0]">
                          {month.label}
                        </div>
                        <button
                          type="submit"
                          disabled={recordSaving}
                          className={
                            entry
                              ? "rounded-xl border border-[#F59E0B]/25 px-3 py-2 text-sm font-medium text-[#F59E0B] disabled:opacity-50"
                              : "rounded-xl bg-[#F59E0B] px-3 py-2 text-sm font-medium text-[#111318] disabled:opacity-50"
                          }
                        >
                          {entry ? "แก้ไข" : "เพิ่ม"}
                        </button>
                      </form>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setRecordUser(null)}
                disabled={recordSaving}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-white/10 text-[#A8AFBD] hover:bg-[#1A1D23]/70 transition-colors disabled:opacity-50"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}
      </AppModal>

      {/* Confirmation Dialog */}
      <AppModal
        open={dialog !== null}
        onClose={() => {
          if (!confirming) setDialog(null);
        }}
        backdropColor="rgba(0,0,0,0.55)"
      >
        <div className="fixed bottom-0 left-0 right-0 rounded-t-2xl bg-[rgb(23,26,32)] shadow-2xl w-full max-h-[65vh] overflow-y-auto p-5 outline-none border border-white/10 animate-in slide-in-from-bottom-6 duration-200 sm:slide-in-from-bottom-0 sm:zoom-in-95 sm:absolute sm:top-1/2 sm:left-1/2 sm:bottom-auto sm:right-auto sm:max-h-[90vh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:w-[calc(100%-2rem)] sm:max-w-sm">
          <div
            className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full ${dialogIconClass}`}
          >
            <DialogIcon size={23} />
          </div>
          {dialog?.type === "saveGroups" && (
            <>
              <div className="mb-6 text-center">
                <h3 className="font-bold text-[#E7EAF0] text-lg">
                  ยืนยันการเปลี่ยนกลุ่ม
                </h3>
              </div>
              <div className="mb-6 space-y-3">
                <p className="text-center text-xs text-[#A8AFBD]">
                  รายการที่จะเปลี่ยน {dialog.changes.length} รายการ
                </p>
                <div className="space-y-2 max-h-48 overflow-x-auto overflow-y-auto">
                  {dialog.changes.map((c) => (
                    <div
                      key={c.userId}
                      className="flex items-center gap-2 text-sm bg-[#0F1115]/55 rounded-lg px-3 py-2 min-w-max"
                    >
                      <span className="font-medium text-[#E7EAF0] flex-1">
                        {c.userName}
                      </span>
                      <span className="text-[#A8AFBD] text-xs">
                        {c.oldGroupName}
                      </span>
                      <span className="text-[#A8AFBD] text-xs">→</span>
                      <span className="text-[#F59E0B] font-medium text-xs">
                        {c.newGroupName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {dialog?.type === "deleteUser" && (
            <>
              <div className="mb-6 text-center">
                <h3 className="font-bold text-[#E7EAF0] text-lg">
                  ยืนยันการลบผู้ใช้
                </h3>
              </div>
              <div className="mb-6 text-center">
                <p className="text-sm text-[#A8AFBD]">
                  ลบ{" "}
                  <span className="font-semibold text-[#E7EAF0]">
                    {dialog.userName}
                  </span>{" "}
                  ออกจากระบบ? ข้อมูลน้ำหนักและรอบเอวทั้งหมดจะถูกลบด้วย
                </p>
              </div>
            </>
          )}
          {dialog?.type === "deleteGroup" && (
            <>
              <div className="mb-6 text-center">
                <h3 className="font-bold text-[#E7EAF0] text-lg">
                  ยืนยันการลบกลุ่ม
                </h3>
              </div>
              <div className="mb-6 text-center">
                <p className="text-sm text-[#A8AFBD]">
                  ลบกลุ่ม{" "}
                  <span className="font-semibold text-[#E7EAF0]">
                    {dialog.groupName}
                  </span>{" "}
                  ออกจากระบบ?
                </p>
              </div>
            </>
          )}
          {dialog?.type === "editGroup" && (
            <>
              <div className="mb-6 text-center">
                <h3 className="font-bold text-[#E7EAF0] text-lg">
                  แก้ไขชื่อกลุ่ม
                </h3>
              </div>
              <div className="space-y-1 mb-6">
                <Label className="text-xs text-[#F59E0B]">ชื่อกลุ่ม</Label>
                <Input
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  autoFocus
                  className="border-white/10 rounded-xl text-sm"
                />
              </div>
            </>
          )}
          {dialog?.type === "editUserName" && (
            <>
              <div className="mb-6 text-center">
                <h3 className="font-bold text-[#E7EAF0] text-lg">แก้ไขชื่อ</h3>
              </div>
              <div className="space-y-3 mb-6">
                <div className="space-y-1">
                  <Label className="text-xs text-[#F59E0B]">ชื่อจริง</Label>
                  <Input
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    autoFocus
                    required
                    className="border-white/10 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-[#F59E0B]">นามสกุล</Label>
                  <Input
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    required
                    className="border-white/10 rounded-xl text-sm"
                  />
                </div>
              </div>
            </>
          )}
          {dialog?.type === "changePassword" && (
            <>
              <div className="mb-6 text-center">
                <h3 className="font-bold text-[#E7EAF0] text-lg">
                  เปลี่ยนรหัสผ่าน
                </h3>
              </div>
              <div className="mb-6 space-y-3">
                <p className="text-center text-xs text-[#A8AFBD]">
                  ผู้ใช้:{" "}
                  <span className="font-semibold text-[#E7EAF0]">
                    {dialog.userName}
                  </span>
                </p>
                <div className="space-y-1">
                  <Label className="text-xs text-[#F59E0B]">
                    รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)
                  </Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError("");
                    }}
                    autoFocus
                    placeholder="รหัสผ่านใหม่"
                    className="border-white/10 rounded-xl text-sm"
                  />
                  {passwordError && (
                    <p className="text-[#D08A8A] text-xs">{passwordError}</p>
                  )}
                </div>
              </div>
            </>
          )}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                setDialog(null);
                setNewPassword("");
                setPasswordError("");
              }}
              disabled={confirming}
              className="flex-1 py-2 rounded-xl text-sm font-medium border border-white/10 text-[#A8AFBD] hover:bg-[#1A1D23]/70 transition-colors disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
                dialog?.type === "deleteUser" || dialog?.type === "deleteGroup"
                  ? "bg-[#7A3434] hover:bg-[#5F2727] text-white"
                  : "bg-[#F59E0B] hover:bg-[#D97706] text-[#111318]"
              }`}
            >
              {confirming ? "กำลังดำเนินการ..." : "ยืนยัน"}
            </button>
          </div>
        </div>
      </AppModal>

      {/* Tab bar */}
      <div className="relative flex bg-[#242832]/65 rounded-xl p-1 mb-5">
        <div
          className="absolute top-1 bottom-1 left-1 rounded-lg bg-[#F59E0B] shadow-sm pointer-events-none"
          style={{
            width: "calc((100% - 8px) / 2)",
            transform: `translateX(${tabIndex * 100}%)`,
            transition: "transform 220ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setActiveTab(t.key);
              startTabTransition(() => setTab(t.key));
            }}
            className={`relative z-10 flex-1 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors duration-200 ${activeTab === t.key ? "text-[#111318]" : "text-[#A8AFBD]"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tabPending || activeTab !== tab ? (
        activeTab === "users" ? (
          <AdminUsersSkeleton />
        ) : (
          <AdminGroupsSkeleton />
        )
      ) : (
        <>
          {/* Users Tab */}
          {tab === "users" && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-[#A8AFBD]">
                  ผู้ใช้ทั้งหมด {users.length} คน
                </p>
                <Button
                  onClick={() => setShowUserForm((v) => !v)}
                  className="bg-[#F59E0B] hover:bg-[#D97706] text-[#111318] rounded-xl text-sm py-1.5 px-3 h-auto"
                >
                  <Plus size={14} className="mr-1" />
                  เพิ่มผู้ใช้
                </Button>
              </div>

              {showUserForm && (
                <div className="glass-card rounded-2xl p-4 mb-4">
                  <h3 className="font-semibold text-[#F59E0B] mb-3 text-sm">
                    เพิ่มผู้ใช้ใหม่
                  </h3>
                  <form action={userFormAction} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-[#F59E0B]">
                          ชื่อจริง
                        </Label>
                        <Input
                          name="firstName"
                          placeholder="ชื่อจริง"
                          required
                          className="border-white/10 rounded-xl text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-[#F59E0B]">
                          นามสกุล
                        </Label>
                        <Input
                          name="lastName"
                          placeholder="นามสกุล"
                          required
                          className="border-white/10 rounded-xl text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-[#F59E0B]">
                          ชื่อผู้ใช้
                        </Label>
                        <Input
                          name="username"
                          placeholder="username"
                          required
                          className="border-white/10 rounded-xl text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-[#F59E0B]">รหัสผ่าน</Label>
                      <Input
                        name="password"
                        type="password"
                        placeholder="อย่างน้อย 6 ตัวอักษร"
                        required
                        className="border-white/10 rounded-xl text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-[#F59E0B]">กลุ่ม</Label>
                        <GlassSelect
                          name="groupId"
                          defaultValue=""
                          options={[
                            { value: "", label: "ยังไม่เข้าร่วมกลุ่ม" },
                            ...groups.map((g) => {
                              const remaining = GROUP_CAPACITY - g.memberCount;
                              const isFull = remaining === 0;
                              return {
                                value: g.id,
                                label: `${g.name} ${isFull ? "(เต็มแล้ว)" : `(ว่าง ${remaining} ที่)`}`,
                                disabled: isFull,
                              };
                            }),
                          ]}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-[#F59E0B]">บทบาท</Label>
                        <GlassSelect
                          name="role"
                          defaultValue="USER"
                          options={[
                            { value: "USER", label: "ผู้ใช้งาน" },
                            { value: "ADMIN", label: "ผู้ดูแลระบบ" },
                          ]}
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={userPending}
                      className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-[#111318] rounded-xl py-2 text-sm"
                    >
                      {userPending ? "กำลังบันทึก..." : "บันทึก"}
                    </Button>
                  </form>
                </div>
              )}

              {/* Search & filter */}
              <div className="glass-card rounded-2xl p-3 mb-3 space-y-2">
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="ค้นหาชื่อ / username..."
                  className="w-full text-sm border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#F59E0B]"
                />
                {/* <GlassSelect
                  size="sm"
                  value={userGroupFilter}
                  onChange={setUserGroupFilter}
                  options={[
                    { value: "", label: "ทุกกลุ่ม" },
                    ...groups.map((g) => ({ value: g.id, label: g.name })),
                  ]}
                /> */}
              </div>

              <div className="glass-card rounded-2xl overflow-clip">
                <div className="overflow-auto max-h-96">
                  <table className="responsive-table w-full min-w-[420px] text-sm">
                    <thead>
                      <tr className="z-50">
                        <th className="sticky top-0 z-20 bg-[#000000] text-left px-3 py-2.5 font-semibold text-[#F59E0B] whitespace-nowrap border-b border-white/10">
                          ชื่อ
                        </th>
                        <th className="sticky top-0 z-20 bg-[#000000] text-left px-3 py-2.5 font-semibold text-[#F59E0B] border-b border-white/10">
                          กลุ่ม
                        </th>
                        <th className="sticky top-0 z-20 bg-[#000000] text-right px-3 py-2.5 font-semibold text-[#F59E0B] border-b border-white/10">
                          รายละเอียด
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u, i) => (
                        <tr
                          key={u.id}
                          className={`border-b border-white/10 last:border-0 ${i % 2 === 0 ? "bg-[#171A20]/70" : "bg-[#0F1115]/55"}`}
                        >
                          <td
                            data-label="ชื่อ"
                            className="px-3 py-2.5 whitespace-nowrap"
                          >
                            <p className="font-medium text-[#E7EAF0] whitespace-nowrap">
                              {u.realName}
                            </p>
                            <p className="mobile-card-hidden text-xs text-[#A8AFBD]">
                              {u.username}
                            </p>
                          </td>
                          <td
                            data-label="user_id"
                            className="responsive-card-only px-3 py-2.5 text-[#E7EAF0] whitespace-nowrap"
                          >
                            {u.username}
                          </td>
                          <td
                            data-label="กลุ่ม"
                            className="px-3 py-2.5 text-[#E7EAF0] whitespace-nowrap"
                          >
                            {u.groupName}
                          </td>
                          <td data-label="" className="px-3 py-2.5 text-right">
                            <div className="admin-user-card-actions flex flex-nowrap justify-end gap-2">
                              <button
                                onClick={() => openUserDetail(u)}
                                className="whitespace-nowrap rounded-lg border border-[#F59E0B]/25 px-3 py-1.5 text-xs font-medium text-[#F59E0B] hover:bg-[#F59E0B]/10 transition-colors"
                              >
                                รายละเอียด
                              </button>
                              <button
                                onClick={() => openPasswordDialog(u)}
                                className="whitespace-nowrap rounded-lg border border-[#F59E0B]/25 px-3 py-1.5 text-xs font-medium text-[#F59E0B] hover:bg-[#F59E0B]/10 transition-colors"
                              >
                                แก้ไขรหัสผ่าน
                              </button>
                              <button
                                onClick={() => setRecordUser(u)}
                                className="admin-user-record-action whitespace-nowrap rounded-lg border border-[#F59E0B]/25 px-3 py-1.5 text-xs font-medium text-[#F59E0B] hover:bg-[#F59E0B]/10 transition-colors"
                              >
                                แก้ไขน้ำหนัก/รอบเอว
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Groups Tab */}
          {tab === "groups" && (
            <div>
              <div className="glass-card rounded-2xl p-3 mb-3">
                <input
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                  placeholder="ค้นหาชื่อกลุ่ม..."
                  className="w-full text-sm border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-[#A8AFBD]">
                  กลุ่มทั้งหมด {groups.length} กลุ่ม
                </p>
                <Button
                  onClick={() => setShowGroupForm((v) => !v)}
                  className="bg-[#F59E0B] hover:bg-[#D97706] text-[#111318] rounded-xl text-sm py-1.5 px-3 h-auto"
                >
                  <Plus size={14} className="mr-1" />
                  เพิ่มกลุ่ม
                </Button>
              </div>

              {showGroupForm && (
                <div className="glass-card rounded-2xl p-4 mb-4">
                  <h3 className="font-semibold text-[#F59E0B] mb-3 text-sm">
                    เพิ่มกลุ่มใหม่
                  </h3>
                  <form action={groupFormAction} className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-[#F59E0B]">
                        ชื่อกลุ่ม
                      </Label>
                      <Input
                        name="name"
                        placeholder="ชื่อกลุ่ม"
                        required
                        className="border-white/10 rounded-xl text-sm"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={groupPending}
                      className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-[#111318] rounded-xl py-2 text-sm"
                    >
                      {groupPending ? "กำลังบันทึก..." : "บันทึก"}
                    </Button>
                  </form>
                </div>
              )}

              <div className="glass-card rounded-2xl overflow-clip">
                <div className="overflow-y-auto max-h-96">
                  <table className="responsive-table w-full text-sm">
                    <thead>
                      <tr>
                        <th className="sticky top-0 z-20 bg-[#1A1D23] text-left px-4 py-2.5 font-semibold text-[#F59E0B] border-b border-white/10">
                          ชื่อกลุ่ม
                        </th>
                        <th className="sticky top-0 z-20 bg-[#1A1D23] text-left px-4 py-2.5 font-semibold text-[#F59E0B] border-b border-white/10">
                          สร้างเมื่อ
                        </th>
                        <th className="sticky top-0 z-20 bg-[#1A1D23] px-4 py-2.5 border-b border-white/10" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGroups.map((g, i) => (
                        <tr
                          key={g.id}
                          className={`border-b border-white/10 last:border-0 ${i % 2 === 0 ? "bg-[#171A20]/70" : "bg-[#0F1115]/55"}`}
                        >
                          <td
                            data-label="ชื่อกลุ่ม"
                            className="px-4 py-2.5 font-medium text-[#E7EAF0]"
                          >
                            {g.name}
                          </td>
                          <td
                            data-label="สร้างเมื่อ"
                            className="px-4 py-2.5 text-xs text-[#A8AFBD]"
                          >
                            {formatThaiDate(new Date(g.createdAt))}
                          </td>
                          <td data-label="จัดการ" className="px-4 py-2.5">
                            <div className="flex items-center gap-3 justify-end">
                              <button
                                onClick={() => {
                                  setEditGroupName(g.name);
                                  setDialog({
                                    type: "editGroup",
                                    groupId: g.id,
                                    groupName: g.name,
                                  });
                                }}
                                className="text-[#A8AFBD] hover:text-[#F59E0B] transition-colors"
                                title="แก้ไขชื่อกลุ่ม"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() =>
                                  setDialog({
                                    type: "deleteGroup",
                                    groupId: g.id,
                                    groupName: g.name,
                                  })
                                }
                                className="text-[#C77D7D] hover:text-[#E2B0B0] transition-colors"
                                title="ลบกลุ่ม"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
