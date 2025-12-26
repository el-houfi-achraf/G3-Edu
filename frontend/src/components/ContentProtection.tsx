'use client';

import { useEffect } from 'react';

export default function ContentProtection() {
  useEffect(() => {
    // Désactiver le clic droit
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Désactiver les raccourcis clavier de copie
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+C, Ctrl+X, Ctrl+U, Ctrl+S, Ctrl+P, F12
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'x' || e.key === 'u' || e.key === 's' || e.key === 'p')) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j'))
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Désactiver la sélection de texte
    const handleSelectStart = (e: Event) => {
      // Permettre la sélection dans les inputs
      if ((e.target as HTMLElement).tagName === 'INPUT' || 
          (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return true;
      }
      e.preventDefault();
      return false;
    };

    // Désactiver le copier
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // Désactiver le drag
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Ajouter les event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('dragstart', handleDragStart);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return null;
}
