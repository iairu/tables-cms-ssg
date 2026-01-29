//
//  TABLESApp.swift
//  TABLES
//
//  Created by Ondrej Špánik on 29/01/2026.
//

import SwiftUI

@main
struct TABLESApp: App {
    let persistenceController = PersistenceController.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
        }
    }
}
