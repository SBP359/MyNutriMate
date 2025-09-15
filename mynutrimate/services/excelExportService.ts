import * as XLSX from 'xlsx';
import type { PatientData } from '../types';
import { getFormattedAgeString } from '../utils/helpers';

export const exportToExcel = (patients: PatientData[], doctorName: string) => {
    const wb = XLSX.utils.book_new();

    // --- Create a Summary Sheet ---
    const summaryData = patients.map(client => {
        const latestHistory = client.history.length > 0 ? client.history[0] : null;
        const totalCaloriesToday = client.history
            .filter(h => new Date(h.date).toDateString() === new Date().toDateString())
            .reduce((sum, h) => sum + h.nutrition.calories, 0);

        return {
            'Full Name': client.profile.fullName,
            'Phone Number': client.profile.phoneNumber,
            'Age': getFormattedAgeString(client.profile.dob),
            'Gender': client.profile.gender,
            'Height (cm)': client.profile.heightCm,
            'Weight (kg)': client.profile.weightKg,
            'Medical History': client.profile.medicalHistory,
            "Total Entries": client.history.length,
            "Last Logged Date": latestHistory ? new Date(latestHistory.date).toLocaleDateString() : 'N/A',
            "Calories Today": totalCaloriesToday > 0 ? totalCaloriesToday.toFixed(0) : 'N/A',
        };
    });
    
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'My Patients');

    // --- Create a Detailed Sheet for Each patient ---
    patients.forEach(client => {
        const clientSheetData = client.history.map(entry => ({
            'Date': new Date(entry.date).toLocaleString(),
            'Food Item': entry.foodName,
            'Est. Weight (g)': entry.estimatedWeightGrams.toFixed(1),
            'Calories (kcal)': entry.nutrition.calories.toFixed(1),
            'Protein (g)': entry.nutrition.proteinGrams.toFixed(1),
            'Carbs (g)': entry.nutrition.carbohydratesGrams.toFixed(1),
            'Fat (g)': entry.nutrition.fatGrams.toFixed(1),
            'Sugar (g)': entry.nutrition.sugarGrams.toFixed(1),
            'Sodium (mg)': entry.nutrition.sodiumMilligrams.toFixed(1),
            'Iron (mg)': entry.nutrition.micronutrients?.ironMg?.toFixed(2) ?? 'N/A',
            'Calcium (mg)': entry.nutrition.micronutrients?.calciumMg?.toFixed(2) ?? 'N/A',
        }));

        const wsClient = XLSX.utils.json_to_sheet(clientSheetData);
        const sheetName = client.profile.fullName?.replace(/[\\/?*:"<>|]/g, '').substring(0, 30) || `Patient_${client.profile.id.substring(0, 5)}`;
        XLSX.utils.book_append_sheet(wb, wsClient, sheetName);
    });

    const fileName = `MyNutriMate_Export_${doctorName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
};