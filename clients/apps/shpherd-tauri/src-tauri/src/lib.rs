// This process hosts presentation only. All future domain actions belong to the daemon.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        .run(tauri::generate_context!())
        .expect("could not start Shpherd presentation host");
}
