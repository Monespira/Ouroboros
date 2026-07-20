using System;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;

internal static class OuroborosServerLauncher
{
    private const int CtrlCloseEvent = 2;
    private static Process server;
    private static HandlerRoutine closeHandler;

    private delegate bool HandlerRoutine(int ctrlType);

    [DllImport("Kernel32")]
    private static extern bool SetConsoleCtrlHandler(HandlerRoutine handler, bool add);

    private static bool HandleConsoleEvent(int ctrlType)
    {
        if (ctrlType == CtrlCloseEvent)
            StopServerTree();
        return false;
    }

    private static void StopServerTree()
    {
        try
        {
            if (server != null && !server.HasExited)
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = "taskkill.exe",
                    Arguments = "/PID " + server.Id + " /T /F",
                    UseShellExecute = false,
                    CreateNoWindow = true
                }).WaitForExit(5000);
            }
        }
        catch { }
    }

    private static int Main()
    {
        Console.Title = "Ouroboros - Servidor (porta 5174)";
        string projectDir = AppDomain.CurrentDomain.BaseDirectory;
        string packageJson = Path.Combine(projectDir, "package.json");

        if (!File.Exists(packageJson))
        {
            Console.Error.WriteLine("ERRO: package.json nao encontrado ao lado do EXE.");
            Console.WriteLine("Coloque o EXE na raiz do projeto Ouroboros.");
            Console.ReadKey(true);
            return 1;
        }

        closeHandler = HandleConsoleEvent;
        SetConsoleCtrlHandler(closeHandler, true);
        Console.CancelKeyPress += delegate(object sender, ConsoleCancelEventArgs e)
        {
            e.Cancel = true;
            StopServerTree();
        };

        Console.WriteLine("Ouroboros - iniciando servidor em http://localhost:5174");
        Console.WriteLine("Feche esta janela para encerrar o servidor.\n");

        try
        {
            server = Process.Start(new ProcessStartInfo
            {
                FileName = "cmd.exe",
                Arguments = "/d /s /c \"npm run dev -- --port 5174\"",
                WorkingDirectory = projectDir,
                UseShellExecute = false
            });
            server.WaitForExit();
            return server.ExitCode;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine("Falha ao iniciar: " + ex.Message);
            Console.WriteLine("Verifique se Node.js e npm estao instalados e no PATH.");
            Console.ReadKey(true);
            return 1;
        }
        finally
        {
            StopServerTree();
            SetConsoleCtrlHandler(closeHandler, false);
        }
    }
}
