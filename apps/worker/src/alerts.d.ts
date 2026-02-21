interface BackupFailureAlertData {
    databaseName: string;
    databaseType: 'postgres' | 'mysql';
    jobId: string;
    errorMessage: string;
}
export declare function sendBackupFailureAlert(data: BackupFailureAlertData, toEmail?: string): Promise<void>;
export {};
//# sourceMappingURL=alerts.d.ts.map