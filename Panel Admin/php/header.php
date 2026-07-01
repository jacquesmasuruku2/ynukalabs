<?php
/**
 * Header commun pour les pages PHP du panel admin
 */
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle ?? 'Panel Admin - Ynuka Labs'; ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #ffb800;
            --primary-dark: #e6a500;
            --dark-bg: #0f172a;
            --dark-card: #1e293b;
            --dark-text: #f1f5f9;
            --dark-border: #334155;
            --light-bg: #f8fafc;
            --light-card: #ffffff;
            --light-text: #0f172a;
            --light-border: #e2e8f0;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .dark-mode {
            background-color: var(--dark-bg);
            color: var(--dark-text);
        }

        .light-mode {
            background-color: var(--light-bg);
            color: var(--light-text);
        }

        .dark-card {
            background-color: var(--dark-card);
            border: 1px solid var(--dark-border);
        }

        .light-card {
            background-color: var(--light-card);
            border: 1px solid var(--light-border);
        }

        .btn-primary {
            background-color: var(--primary);
            color: #111;
            transition: all 0.2s;
        }

        .btn-primary:hover {
            background-color: var(--primary-dark);
        }

        .badge-sent {
            background-color: #22c55e;
            color: white;
        }

        .badge-sending {
            background-color: #f59e0b;
            color: white;
        }

        .badge-draft {
            background-color: #6b7280;
            color: white;
        }

        .sidebar-link {
            transition: all 0.2s;
        }

        .sidebar-link:hover {
            background-color: rgba(255, 184, 0, 0.1);
        }

        .sidebar-link.active {
            background-color: rgba(255, 184, 0, 0.2);
            border-left: 3px solid var(--primary);
        }
    </style>
</head>
<body class="dark-mode min-h-screen">
    <div class="flex min-h-screen">
        <!-- Sidebar -->
        <aside class="w-64 dark-card border-r border-slate-700 p-4 flex flex-col">
            <div class="mb-8">
                <h1 class="text-2xl font-bold">
                    Ynuka <span style="color: var(--primary);">Labs</span>
                </h1>
                <p class="text-sm text-slate-400">Panel Admin</p>
            </div>

            <nav class="flex-1 space-y-2">
                <a href="/admin" class="sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white">
                    <i class="fas fa-home"></i>
                    <span>Dashboard</span>
                </a>
                <a href="./index.php" class="sidebar-link active flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white">
                    <i class="fas fa-envelope"></i>
                    <span>Newsletter</span>
                </a>
                <a href="/admin/newsletter_subscribers" class="sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white">
                    <i class="fas fa-users"></i>
                    <span>Abonnés</span>
                </a>
                <a href="/admin" class="sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white">
                    <i class="fas fa-cog"></i>
                    <span>Paramètres</span>
                </a>
            </nav>

            <div class="pt-4 border-t border-slate-700">
                <a href="/admin" class="sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Déconnexion</span>
                </a>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 p-8">
