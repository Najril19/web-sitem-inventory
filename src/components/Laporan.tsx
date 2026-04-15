import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Download, Filter, Package, TrendingUp, TrendingDown, Pencil, Trash2, Check, FileSpreadsheet } from 'lucide-react';
import { InventoryDatePicker } from '@/components/InventoryDatePicker';
import { authStorage } from '@/lib/auth';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

type LaporanType = 'barang' | 'masuk' | 'keluar';

export default function Laporan() {
  const [activeReport, setActiveReport] = useState<LaporanType>('barang');
  const [dateFrom, setDateFrom] = useState('2026-04-01');
  const [dateTo, setDateTo] = useState('2026-04-13');
  const [dataBarang, setDataBarang] = useState<any[]>([]);
  const [dataMasuk, setDataMasuk] = useState<any[]>([]);
  const [dataKeluar, setDataKeluar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('Admin');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('Admin');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const fetchData = async () => {
    try {
      const token = authStorage.getToken();
      
      const [barangRes, masukRes, keluarRes] = await Promise.all([
        fetch('/api/barang', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/transaksi-masuk', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/transaksi-keluar', { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);

      const barangResult = await barangRes.json();
      const masukResult = await masukRes.json();
      const keluarResult = await keluarRes.json();

      if (barangResult.success) setDataBarang(barangResult.data);
      if (masukResult.success) setDataMasuk(masukResult.data);
      if (keluarResult.success) setDataKeluar(keluarResult.data);
    } catch (error) {
      console.error('Error fetching laporan data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Signature pad functions
  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    lastPos.current = getPos(e);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const reports = [
    { id: 'barang' as LaporanType, name: 'Data Barang', icon: Package, color: 'blue' },
    { id: 'masuk' as LaporanType, name: 'Barang Masuk', icon: TrendingUp, color: 'emerald' },
    { id: 'keluar' as LaporanType, name: 'Barang Keluar', icon: TrendingDown, color: 'orange' },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = async () => {
    const reportTitle = reports.find(r => r.id === activeReport)?.name || '';
    const now = new Date();
    const printDate = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const printTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const printDateShort = now.toLocaleDateString('id-ID');

    // ── Config per tipe laporan ──────────────────────────────────────────────
    type ColConfig = { header: string; key: string; width: number; align: 'left' | 'center' | 'right' };

    let sheetName = '';
    let fileName = '';
    let headerBg = '1A3A5C';      // warna header tabel
    let headerAccent = '2563EB';  // warna aksen (stripe, border)
    let colConfigs: ColConfig[] = [];
    let rows: (string | number)[][] = [];
    let totalLabel = '';
    let totalValue = 0;

    if (activeReport === 'barang') {
      sheetName = 'Data Barang';
      fileName = `Laporan_Data_Barang_${now.toISOString().slice(0,10)}.xlsx`;
      headerBg = '1A3A5C'; headerAccent = '2563EB';
      colConfigs = [
        { header: 'No',          key: 'no',          width: 6,  align: 'center' },
        { header: 'Kode Barang', key: 'kode',        width: 16, align: 'center' },
        { header: 'Nama Barang', key: 'nama',        width: 36, align: 'left'   },
        { header: 'Merk',        key: 'merk',        width: 22, align: 'left'   },
        { header: 'Stok',        key: 'stok',        width: 10, align: 'center' },
        { header: 'Harga Jual',  key: 'harga',       width: 22, align: 'right'  },
      ];
      rows = dataBarang.map((item, i) => [
        i + 1,
        item.kode_barang || '-',
        item.nama_barang || '-',
        typeof item.merk === 'string' ? item.merk : '-',
        item.stok ?? 0,
        item.harga_jual ?? 0,
      ]);
    } else if (activeReport === 'masuk') {
      sheetName = 'Barang Masuk';
      fileName = `Laporan_Barang_Masuk_${now.toISOString().slice(0,10)}.xlsx`;
      headerBg = '14532D'; headerAccent = '16A34A';
      colConfigs = [
        { header: 'No',          key: 'no',       width: 6,  align: 'center' },
        { header: 'Tanggal',     key: 'tanggal',  width: 18, align: 'center' },
        { header: 'Nama Barang', key: 'nama',     width: 36, align: 'left'   },
        { header: 'Jumlah',      key: 'jumlah',   width: 12, align: 'center' },
        { header: 'Supplier',    key: 'supplier', width: 28, align: 'left'   },
      ];
      rows = dataMasuk.map((item, i) => [
        i + 1,
        item.tanggal || '-',
        typeof item.barang === 'string' ? item.barang : item.barang?.nama_barang || '-',
        item.jumlah ?? 0,
        typeof item.supplier === 'string' ? item.supplier : item.supplier?.nama || '-',
      ]);
      totalLabel = 'TOTAL BARANG MASUK';
      totalValue = dataMasuk.reduce((s, it) => s + (it.jumlah || 0), 0);
    } else {
      sheetName = 'Barang Keluar';
      fileName = `Laporan_Barang_Keluar_${now.toISOString().slice(0,10)}.xlsx`;
      headerBg = '7C2D12'; headerAccent = 'EA580C';
      colConfigs = [
        { header: 'No',          key: 'no',      width: 6,  align: 'center' },
        { header: 'Tanggal',     key: 'tanggal', width: 18, align: 'center' },
        { header: 'Nama Barang', key: 'nama',    width: 36, align: 'left'   },
        { header: 'Jumlah',      key: 'jumlah',  width: 12, align: 'center' },
        { header: 'Tujuan',      key: 'tujuan',  width: 28, align: 'left'   },
      ];
      rows = dataKeluar.map((item, i) => [
        i + 1,
        item.tanggal || '-',
        typeof item.barang === 'string' ? item.barang : item.barang?.nama_barang || '-',
        item.jumlah ?? 0,
        item.tujuan || '-',
      ]);
      totalLabel = 'TOTAL BARANG KELUAR';
      totalValue = dataKeluar.reduce((s, it) => s + (it.jumlah || 0), 0);
    }

    const numCols = colConfigs.length;
    const C_OUTER  = 'FF' + headerBg;
    const C_ACCENT = 'FF' + headerAccent;
    const C_INNER  = 'FFD1D9E8';
    const BG_WHITE = 'FFFFFFFF';
    const BG_HEADER_DOC = 'FF' + headerBg;
    const BG_ROW_ODD  = 'FFF0F5FF';
    const BG_ROW_EVEN = 'FFFAFCFF';
    const BG_SECTION  = 'FFF8FAFF';

    // ── Workbook & worksheet ─────────────────────────────────────────────────
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Toko El-Hibbani';
    wb.created = now;
    const ws = wb.addWorksheet(sheetName, {
      pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1 },
      views: [{ showGridLines: false }],
    });

    ws.columns = colConfigs.map(c => ({ width: c.width }));

    const borderFull = (
      top: ExcelJS.Border,
      bottom: ExcelJS.Border,
      left: ExcelJS.Border,
      right: ExcelJS.Border,
    ) => ({ top, bottom, left, right } as ExcelJS.Borders);

    const bMedium = (color: string): ExcelJS.Border => ({ style: 'medium', color: { argb: color } });
    const bThin   = (color: string): ExcelJS.Border => ({ style: 'thin',   color: { argb: color } });
    const bHair   = (color: string): ExcelJS.Border => ({ style: 'hair',   color: { argb: color } });

    const applyRowStyle = (
      row: ExcelJS.Row,
      bg: string,
      borderTop: ExcelJS.Border,
      borderBot: ExcelJS.Border,
    ) => {
      for (let c = 1; c <= numCols; c++) {
        const cell = row.getCell(c);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
        cell.border = borderFull(
          borderTop, borderBot,
          c === 1       ? bMedium(C_OUTER) : bHair(bg),
          c === numCols ? bMedium(C_OUTER) : bHair(bg),
        );
      }
    };

    const addMerged = (
      text: string,
      height: number,
      bg: string,
      font: Partial<ExcelJS.Font>,
      align: ExcelJS.Alignment['horizontal'],
      borderTop: ExcelJS.Border,
      borderBot: ExcelJS.Border,
    ) => {
      const row = ws.addRow(Array(numCols).fill(''));
      row.height = height;
      applyRowStyle(row, bg, borderTop, borderBot);
      ws.mergeCells(row.number, 1, row.number, numCols);
      const cell = row.getCell(1);
      cell.value = text;
      cell.font = { name: 'Calibri', ...font };
      cell.alignment = { horizontal: align, vertical: 'middle', wrapText: false };
      return row;
    };

    const addSpacer = (height: number, bg: string) => {
      const row = ws.addRow(Array(numCols).fill(''));
      row.height = height;
      applyRowStyle(row, bg, bHair(bg), bHair(bg));
      return row;
    };

    // ── KOP SURAT ────────────────────────────────────────────────────────────
    addMerged('TOKO EL-HIBBANI', 44, BG_HEADER_DOC,
      { bold: true, size: 24, color: { argb: 'FFFFFFFF' } },
      'center', bMedium(C_OUTER), bHair(BG_HEADER_DOC));

    addMerged('Sistem Informasi Persediaan Barang', 20, BG_HEADER_DOC,
      { size: 11, italic: true, color: { argb: 'FFBFDBFE' } },
      'center', bHair(BG_HEADER_DOC), bHair(BG_HEADER_DOC));

    // Stripe aksen
    const accentRow = ws.addRow(Array(numCols).fill(''));
    accentRow.height = 6;
    for (let c = 1; c <= numCols; c++) {
      const cell = accentRow.getCell(c);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_ACCENT } };
      cell.border = borderFull(bHair(C_ACCENT), bHair(C_ACCENT),
        c === 1 ? bMedium(C_OUTER) : bHair(C_ACCENT),
        c === numCols ? bMedium(C_OUTER) : bHair(C_ACCENT));
    }

    // ── INFO LAPORAN ─────────────────────────────────────────────────────────
    addSpacer(8, BG_SECTION);
    addMerged(`LAPORAN ${reportTitle.toUpperCase()}`, 30, BG_SECTION,
      { bold: true, size: 16, color: { argb: C_OUTER } },
      'center', bHair(BG_SECTION), bHair(BG_SECTION));
    addMerged(`Dicetak pada: ${printDate}, Pukul ${printTime} WIB`, 18, BG_SECTION,
      { size: 10, italic: true, color: { argb: 'FF64748B' } },
      'center', bHair(BG_SECTION), bHair(BG_SECTION));
    addSpacer(6, BG_SECTION);

    // Garis pemisah sebelum tabel
    const divRow = ws.addRow(Array(numCols).fill(''));
    divRow.height = 3;
    for (let c = 1; c <= numCols; c++) {
      const cell = divRow.getCell(c);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_ACCENT } };
      cell.border = borderFull(bHair(C_ACCENT), bHair(C_ACCENT),
        c === 1 ? bMedium(C_OUTER) : bHair(C_ACCENT),
        c === numCols ? bMedium(C_OUTER) : bHair(C_ACCENT));
    }

    // ── HEADER TABEL ─────────────────────────────────────────────────────────
    const tblHeaderRow = ws.addRow(colConfigs.map(c => c.header));
    tblHeaderRow.height = 28;
    tblHeaderRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
      cell.value = colConfigs[colNum - 1].header;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BG_HEADER_DOC } };
      cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: false };
      cell.border = borderFull(
        bMedium(C_ACCENT), bMedium(C_ACCENT),
        colNum === 1       ? bMedium(C_OUTER) : bThin(C_ACCENT),
        colNum === numCols ? bMedium(C_OUTER) : bThin(C_ACCENT),
      );
    });

    // ── BARIS DATA ───────────────────────────────────────────────────────────
    rows.forEach((rowData, idx) => {
      const row = ws.addRow(rowData);
      row.height = 22;
      const bg = idx % 2 === 0 ? BG_ROW_ODD : BG_ROW_EVEN;
      const isLastRow = idx === rows.length - 1;

      row.eachCell({ includeEmpty: true }, (cell, colNum) => {
        const cfg = colConfigs[colNum - 1];

        // Format harga untuk barang
        if (activeReport === 'barang' && colNum === 6) {
          const val = typeof cell.value === 'number' ? cell.value : 0;
          cell.value = val;
          cell.numFmt = '"Rp "#,##0';
        }

        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
        cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF1E293B' } };
        cell.alignment = { horizontal: cfg.align, vertical: 'middle', wrapText: false };
        cell.border = borderFull(
          bThin(C_INNER),
          isLastRow ? bMedium(C_ACCENT) : bThin(C_INNER),
          colNum === 1       ? bMedium(C_OUTER) : bThin(C_INNER),
          colNum === numCols ? bMedium(C_OUTER) : bThin(C_INNER),
        );
      });
    });

    // ── BARIS TOTAL ──────────────────────────────────────────────────────────
    if (totalLabel) {
      const isMasuk = activeReport === 'masuk';
      const totalBg   = isMasuk ? 'FFD1FAE5' : 'FFFEF3C7';
      const totalFg   = isMasuk ? 'FF065F46' : 'FF92400E';
      const totalBord = isMasuk ? 'FF16A34A' : 'FFEA580C';

      addSpacer(4, BG_SECTION);

      const totalRowData: (string | number)[] = Array(numCols).fill('');
      totalRowData[numCols - 3] = totalLabel;
      totalRowData[numCols - 2] = totalValue;
      totalRowData[numCols - 1] = 'Unit';

      const tRow = ws.addRow(totalRowData);
      tRow.height = 28;
      tRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: totalBg } };
        cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: totalFg } };
        cell.border = borderFull(
          bMedium(totalBord), bMedium(totalBord),
          colNum === 1       ? bMedium(C_OUTER) : bThin(totalBord),
          colNum === numCols ? bMedium(C_OUTER) : bThin(totalBord),
        );
        if (colNum === numCols - 2) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        } else if (colNum === numCols - 1 || colNum === numCols) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else {
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
        }
      });
    }

    // ── TANDA TANGAN ─────────────────────────────────────────────────────────
    addSpacer(16, BG_SECTION);

    const ttdLabelRow = ws.addRow(Array(numCols).fill(''));
    ttdLabelRow.height = 16;
    applyRowStyle(ttdLabelRow, BG_SECTION, bHair(BG_SECTION), bHair(BG_SECTION));
    ws.mergeCells(ttdLabelRow.number, numCols - 1, ttdLabelRow.number, numCols);
    const ttdLabelCell = ttdLabelRow.getCell(numCols - 1);
    ttdLabelCell.value = printDateShort;
    ttdLabelCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ttdLabelCell.font = { name: 'Calibri', size: 10, color: { argb: 'FF475569' } };

    const ttdKnowRow = ws.addRow(Array(numCols).fill(''));
    ttdKnowRow.height = 16;
    applyRowStyle(ttdKnowRow, BG_SECTION, bHair(BG_SECTION), bHair(BG_SECTION));
    ws.mergeCells(ttdKnowRow.number, numCols - 1, ttdKnowRow.number, numCols);
    const ttdKnowCell = ttdKnowRow.getCell(numCols - 1);
    ttdKnowCell.value = 'Mengetahui,';
    ttdKnowCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ttdKnowCell.font = { name: 'Calibri', size: 10, color: { argb: 'FF475569' } };

    // Kotak TTD
    const sigStartRow = ws.rowCount + 1;
    const SIG_ROWS = 5;
    for (let i = 0; i < SIG_ROWS; i++) {
      const r = ws.addRow(Array(numCols).fill(''));
      r.height = 20;
      applyRowStyle(r, BG_SECTION, bHair(BG_SECTION), bHair(BG_SECTION));
      ws.mergeCells(r.number, numCols - 1, r.number, numCols);
      const sigCell = r.getCell(numCols - 1);
      sigCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BG_WHITE } };
      sigCell.border = borderFull(
        i === 0          ? bMedium('FF94A3B8') : bHair(C_INNER),
        i === SIG_ROWS-1 ? bMedium('FF94A3B8') : bHair(C_INNER),
        bMedium('FF94A3B8'),
        bMedium('FF94A3B8'),
      );
    }

    if (hasSignature && canvasRef.current) {
      const base64 = canvasRef.current.toDataURL('image/png').replace('data:image/png;base64,', '');
      const imgId = wb.addImage({ base64, extension: 'png' });
      ws.addImage(imgId, {
        tl: { col: numCols - 2, row: sigStartRow - 1 } as any,
        br: { col: numCols,     row: sigStartRow + SIG_ROWS - 1 } as any,
        editAs: 'oneCell',
      });
    }

    const nameRow = ws.addRow(Array(numCols).fill(''));
    nameRow.height = 22;
    applyRowStyle(nameRow, BG_SECTION, bHair(BG_SECTION), bHair(BG_SECTION));
    ws.mergeCells(nameRow.number, numCols - 1, nameRow.number, numCols);
    const nameCell = nameRow.getCell(numCols - 1);
    nameCell.value = `( ${adminName} )`;
    nameCell.alignment = { horizontal: 'center', vertical: 'middle' };
    nameCell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: 'FF1E293B' } };

    const roleRow = ws.addRow(Array(numCols).fill(''));
    roleRow.height = 16;
    applyRowStyle(roleRow, BG_SECTION, bHair(BG_SECTION), bHair(BG_SECTION));
    ws.mergeCells(roleRow.number, numCols - 1, roleRow.number, numCols);
    const roleCell = roleRow.getCell(numCols - 1);
    roleCell.value = 'Admin / Penanggung Jawab';
    roleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    roleCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF64748B' } };

    // ── FOOTER PENUTUP ───────────────────────────────────────────────────────
    addSpacer(10, BG_SECTION);

    const footerRow = ws.addRow(Array(numCols).fill(''));
    footerRow.height = 3;
    for (let c = 1; c <= numCols; c++) {
      const cell = footerRow.getCell(c);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BG_HEADER_DOC } };
      cell.border = borderFull(
        bHair(BG_HEADER_DOC), bMedium(C_OUTER),
        c === 1       ? bMedium(C_OUTER) : bHair(BG_HEADER_DOC),
        c === numCols ? bMedium(C_OUTER) : bHair(BG_HEADER_DOC),
      );
    }

    // ── Simpan file ──────────────────────────────────────────────────────────
    const buffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), fileName);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Laporan Persediaan</h1>
          <p className="text-gray-400 mt-1">Lihat dan cetak laporan inventori</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleExportExcel()}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg shadow-lg shadow-green-600/30 hover:shadow-xl transition-all"
          >
            <FileSpreadsheet className="w-5 h-5" />
            Export Excel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all"
          >
            <Download className="w-5 h-5" />
            Cetak Laporan
          </motion.button>
        </div>
      </motion.div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports.map((report, index) => (
          <motion.button
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            onClick={() => setActiveReport(report.id)}
            className={`p-6 rounded-xl shadow-lg border-2 transition-all ${
              activeReport === report.id
                ? `border-${report.color}-500 bg-${report.color}-500/20 shadow-${report.color}-500/30`
                : 'border-gray-700 bg-gray-800 hover:border-gray-600 shadow-black/50'
            }`}
          >
            <div className={`p-3 rounded-lg inline-block mb-3 ${
              activeReport === report.id ? `bg-${report.color}-500/20 border border-${report.color}-500/30` : 'bg-gray-700 border border-gray-600'
            }`}>
              <report.icon className={`w-6 h-6 ${
                activeReport === report.id ? `text-${report.color}-400` : 'text-gray-400'
              }`} />
            </div>
            <p className={`font-medium ${
              activeReport === report.id ? `text-${report.color}-400` : 'text-gray-300'
            }`}>
              {report.name}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Filter Section */}
      {(activeReport === 'masuk' || activeReport === 'keluar') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl shadow-lg shadow-black/50 p-6 border border-gray-700"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-white">Filter Tanggal</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Dari Tanggal</label>
              <InventoryDatePicker
                value={dateFrom}
                onChange={setDateFrom}
                accent="blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sampai Tanggal</label>
              <InventoryDatePicker
                value={dateTo}
                onChange={setDateTo}
                accent="blue"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Report Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-xl shadow-lg shadow-black/50 border border-gray-700 overflow-hidden"
      >
        {/* Report Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">TOKO EL-HIBBANI</h2>
            <p className="text-gray-400 mt-1">Sistem Informasi Persediaan Barang</p>
            <div className="mt-4">
              <h3 className="text-xl font-semibold text-white">
                Laporan {reports.find(r => r.id === activeReport)?.name}
              </h3>
              {(activeReport === 'masuk' || activeReport === 'keluar') && (
                <p className="text-sm text-gray-400 mt-1">
                  Periode: {new Date(dateFrom).toLocaleDateString('id-ID')} - {new Date(dateTo).toLocaleDateString('id-ID')}
                </p>
              )}
              <p className="text-sm text-gray-400">
                Dicetak pada: {new Date().toLocaleDateString('id-ID')} {new Date().toLocaleTimeString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto p-6">
          {activeReport === 'barang' && (
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">No</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Kode</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Nama Barang</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Stok</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Harga</th>
                </tr>
              </thead>
              <tbody>
                {dataBarang.map((item, index) => (
                  <tr key={item.kode_barang || item.id} className="hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{index + 1}</td>
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{item.kode_barang || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{item.nama_barang} {typeof item.merk === 'string' ? item.merk : ''}</td>
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{item.stok || 0}</td>
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">Rp {(item.harga_jual || 0).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'masuk' && (
            <table className="w-full">
              <thead className="bg-emerald-500/20">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">No</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Tanggal</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Nama Barang</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Jumlah</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Supplier</th>
                </tr>
              </thead>
              <tbody>
                {dataMasuk.map((item, index) => (
                  <tr key={index} className="hover:bg-emerald-500/10">
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{index + 1}</td>
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{item.tanggal || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{typeof item.barang === 'string' ? item.barang : item.barang?.nama_barang || 'N/A'}</td>
                    <td className="px-4 py-3 text-emerald-400 font-medium border border-gray-700">+{item.jumlah || 0}</td>
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{typeof item.supplier === 'string' ? item.supplier : item.supplier?.nama || 'N/A'}</td>
                  </tr>
                ))}
                <tr className="bg-emerald-500/20 font-semibold">
                  <td colSpan={3} className="px-4 py-3 text-right text-white border border-gray-700">Total Barang Masuk:</td>
                  <td className="px-4 py-3 text-emerald-400 border border-gray-700">{dataMasuk.reduce((sum, item) => sum + (item.jumlah || 0), 0)} Unit</td>
                  <td className="border border-gray-700"></td>
                </tr>
              </tbody>
            </table>
          )}

          {activeReport === 'keluar' && (
            <table className="w-full">
              <thead className="bg-orange-500/20">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">No</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Tanggal</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Nama Barang</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Jumlah</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Tujuan</th>
                </tr>
              </thead>
              <tbody>
                {dataKeluar.map((item, index) => (
                  <tr key={index} className="hover:bg-orange-500/10">
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{index + 1}</td>
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{item.tanggal || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{typeof item.barang === 'string' ? item.barang : item.barang?.nama_barang || 'N/A'}</td>
                    <td className="px-4 py-3 text-orange-400 font-medium border border-gray-700">-{item.jumlah || 0}</td>
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{item.tujuan || 'N/A'}</td>
                  </tr>
                ))}
                <tr className="bg-orange-500/20 font-semibold">
                  <td colSpan={3} className="px-4 py-3 text-right text-white border border-gray-700">Total Barang Keluar:</td>
                  <td className="px-4 py-3 text-orange-400 border border-gray-700">{dataKeluar.reduce((sum, item) => sum + (item.jumlah || 0), 0)} Unit</td>
                  <td className="border border-gray-700"></td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-900">
          <div className="flex justify-between items-start gap-8">
            {/* Left - Toko Info */}
            <div>
              <p className="text-sm text-gray-300 font-medium">Toko El-Hibbani</p>
              <p className="text-xs text-gray-500">Sistem Informasi Persediaan Barang</p>
            </div>

            {/* Right - Signature Area */}
            <div className="flex flex-col items-center gap-2 min-w-[220px]">
              <p className="text-xs text-gray-400">Tanda Tangan Admin</p>

              {/* Canvas Signature Pad */}
              <div className="relative border border-gray-600 rounded-lg overflow-hidden bg-gray-800/50 cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  width={220}
                  height={100}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="block touch-none"
                />
                {!hasSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Pencil className="w-3 h-3" />
                      Tanda tangan di sini
                    </p>
                  </div>
                )}
              </div>

              {/* Clear button */}
              {hasSignature && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearSignature}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Hapus Tanda Tangan
                </motion.button>
              )}

              {/* Admin Name - Editable */}
              <div className="flex items-center gap-2 mt-1">
                {isEditingName ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setAdminName(tempName || 'Admin');
                          setIsEditingName(false);
                        }
                        if (e.key === 'Escape') {
                          setTempName(adminName);
                          setIsEditingName(false);
                        }
                      }}
                      autoFocus
                      className="text-sm text-white bg-gray-700 border border-blue-500 rounded px-2 py-0.5 w-32 focus:outline-none"
                    />
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setAdminName(tempName || 'Admin');
                        setIsEditingName(false);
                      }}
                      className="text-emerald-400 hover:text-emerald-300"
                    >
                      <Check className="w-4 h-4" />
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      setTempName(adminName);
                      setIsEditingName(true);
                    }}
                    className="flex items-center gap-1 text-sm text-gray-300 hover:text-white transition-colors group"
                  >
                    <span className="font-medium">{adminName}</span>
                    <Pencil className="w-3 h-3 text-gray-500 group-hover:text-blue-400 transition-colors" />
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
