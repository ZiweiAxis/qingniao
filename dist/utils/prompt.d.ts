/**
 * 交互式输入工具
 */
export interface PromptOptions {
    mask?: boolean;
}
/**
 * 交互式提示用户输入
 * @param question 提示问题
 * @param opts 选项，如 mask 用于密码输入
 * @returns 用户输入的内容
 */
export declare function prompt(question: string, opts?: PromptOptions): Promise<string>;
/**
 * 从 stdin 读取内容（非 TTY 模式）
 * @returns stdin 的内容
 */
export declare function readStdin(): string;
