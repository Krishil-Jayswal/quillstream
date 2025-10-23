export class ExponentialBackoff {
  private currentBackoff: number;

  constructor(
    private readonly minBackoffMs: number = 5000,
    private readonly maxBackoffMs: number = 30000,
    private readonly multiplier: number = 1.5,
  ) {
    this.currentBackoff = minBackoffMs;
  }

  async wait() {
    await new Promise((r) => setTimeout(r, this.currentBackoff));
    this.increase();
  }

  private increase() {
    this.currentBackoff =
      this.currentBackoff === this.maxBackoffMs
        ? this.minBackoffMs
        : Math.min(this.currentBackoff * this.multiplier, this.maxBackoffMs);
  }

  reset() {
    this.currentBackoff = this.minBackoffMs;
  }
}
