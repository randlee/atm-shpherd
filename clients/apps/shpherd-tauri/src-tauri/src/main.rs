#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    shpherd_tauri_lib::run();
}
