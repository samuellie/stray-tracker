import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind class names, resolving any conflicts.
 *
 * @param inputs - An array of class names to merge.
 * @returns A string of merged and optimized class names.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Extracts the base name of a file without its extension.
 *
 * @param fileName - The full file name including extension.
 * @returns The file name without the extension.
 */
export function getBaseFileName(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '')
}
