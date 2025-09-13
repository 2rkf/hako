export type CaptchaType = "create" | "reply" | "report";

export interface Captcha {
  uuid: string
  svg: string
}

export interface CaptchaState {
  captcha: Captcha | null;
  cooldown: number;
  refreshCount: number;
  cooldownUntil: number;
  cooldownInterval: NodeJS.Timeout | null;
}

export interface CaptchaSubmission {
  captcha: string
  uuid: string
}
