#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::TrayIconBuilder,
    AppHandle, Emitter, Manager,
};
use tauri_plugin_clipboard_manager::ClipboardExt;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

// ── Commands callable from the frontend ──────────────────────────────────────

#[tauri::command]
fn read_clipboard(app: AppHandle) -> Result<String, String> {
    app.clipboard()
        .read_text()
        .map(|v| v.unwrap_or_default())
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn write_clipboard(app: AppHandle, text: String) -> Result<(), String> {
    app.clipboard().write_text(text).map_err(|e| e.to_string())
}

#[tauri::command]
fn simulate_paste() {
    // Hide the overlay first so the paste goes to the underlying app.
    // The frontend hides the window before calling this, but we add a delay
    // to be safe.
    std::thread::sleep(std::time::Duration::from_millis(350));
    do_paste();
}

#[tauri::command]
fn dismiss(app: AppHandle) {
    hide_overlay(&app);
}

// ── Internal helpers ─────────────────────────────────────────────────────────

fn hide_overlay(app: &AppHandle) {
    if let Some(w) = app.get_webview_window("overlay") {
        let _ = w.hide();
    }
}

fn show_overlay(app: &AppHandle) {
    if let Some(w) = app.get_webview_window("overlay") {
        let _ = w.show();
        let _ = w.set_focus();
    }
}

/// Copy selected text from whichever app was previously focused.
fn do_copy() {
    use enigo::{Direction, Enigo, Key, Keyboard, Settings};
    if let Ok(mut e) = Enigo::new(&Settings::default()) {
        #[cfg(target_os = "macos")]
        let modifier = Key::Meta;
        #[cfg(not(target_os = "macos"))]
        let modifier = Key::Control;

        let _ = e.key(modifier, Direction::Press);
        let _ = e.key(Key::Unicode('c'), Direction::Click);
        let _ = e.key(modifier, Direction::Release);
    }
}

/// Paste clipboard content into whichever app is now focused.
fn do_paste() {
    use enigo::{Direction, Enigo, Key, Keyboard, Settings};
    if let Ok(mut e) = Enigo::new(&Settings::default()) {
        #[cfg(target_os = "macos")]
        let modifier = Key::Meta;
        #[cfg(not(target_os = "macos"))]
        let modifier = Key::Control;

        let _ = e.key(modifier, Direction::Press);
        let _ = e.key(Key::Unicode('v'), Direction::Click);
        let _ = e.key(modifier, Direction::Release);
    }
}

/// Triggered by hotkey or tray — copies selected text then opens overlay.
fn trigger_improve(app: AppHandle) {
    // 1. Copy whatever the user has selected in the foreground app
    do_copy();

    // 2. Brief delay for clipboard to settle
    std::thread::sleep(std::time::Duration::from_millis(250));

    // 3. Show the overlay and tell the frontend to start improving
    show_overlay(&app);
    let _ = app.emit("do-improve", ());
}

fn open_settings(app: AppHandle) {
    show_overlay(&app);
    let _ = app.emit("open-settings", ());
}

// ── Entry point ──────────────────────────────────────────────────────────────

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        trigger_improve(app.clone());
                    }
                })
                .build(),
        )
        .setup(|app| {
            // ── Register global shortcut ──────────────────────────────
            app.global_shortcut().register("CmdOrCtrl+Shift+I")?;

            // ── System tray ───────────────────────────────────────────
            let improve = MenuItem::with_id(
                app,
                "improve",
                "Improve Selected Text  ⌘⇧I",
                true,
                None::<&str>,
            )?;
            let settings =
                MenuItem::with_id(app, "settings", "Settings…", true, None::<&str>)?;
            let sep = PredefinedMenuItem::separator(app)?;
            let quit =
                MenuItem::with_id(app, "quit", "Quit Prompt Labs", true, None::<&str>)?;

            let menu = Menu::with_items(app, &[&improve, &settings, &sep, &quit])?;

            TrayIconBuilder::new()
                .menu(&menu)
                .menu_on_left_click(false)
                .icon(app.default_window_icon().unwrap().clone())
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "improve" => trigger_improve(app.clone()),
                    "settings" => open_settings(app.clone()),
                    "quit" => std::process::exit(0),
                    _ => {}
                })
                .build(app)?;

            // ── macOS: hide from Dock, run as menu-bar-only app ───────
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            read_clipboard,
            write_clipboard,
            simulate_paste,
            dismiss,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Prompt Labs");
}
