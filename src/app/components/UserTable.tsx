"use client";
import { useState, useRef, useEffect } from "react";
import {
  PencilIcon,
  DownloadSimpleIcon,
  TrashIcon,
  FunnelIcon,
  PlusIcon,
  MicrosoftExcelLogoIcon,
  EyeClosedIcon,
  ListIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FileTextIcon,
  BuildingIcon,
  UserIcon,
  FileIcon,
  WarningIcon,
  FilePdfIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  XIcon,
  CaretUpDownIcon
} from "@phosphor-icons/react";

interface Application {
  id: number;
  direction: string;
  reportRequested: boolean;
  reportRequestDate: string | null;
  invoiceDate: string;
  inn: string;
  organizationName: string;
  kfVvPaid: string;
  kfOdoPaid: string;
  chvPaid: string;
  vstPaid: string;
  objectType: string;
  responsible: string;
  status: string;
  documentType: string;
  remarksCount: number;
  hasRemarks: boolean;
}

interface FilterPopupProps {
  columnKey: string;
  columnLabel: string;
  values: string[];
  selectedValues: string[];
  onApply: (selected: string[]) => void;
  onClose: () => void;
  triggerRect: DOMRect | null;
}

const FilterPopup: React.FC<FilterPopupProps> = ({
  columnLabel,
  values,
  selectedValues,
  onApply,
  onClose,
  triggerRect
}) => {
  const [search, setSearch] = useState("");
  const [localSelected, setLocalSelected] = useState<string[]>(selectedValues);
  const popupRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Рассчитываем позицию попапа
  useEffect(() => {
    if (triggerRect && popupRef.current) {
      const popupWidth = 288; // w-72 = 288px
      const popupHeight = popupRef.current.offsetHeight;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Вычисляем позицию для центрирования по горизонтали относительно кнопки
      let left = triggerRect.left + (triggerRect.width / 2) - (popupWidth / 2);
      
      // Проверяем, чтобы попап не выходил за границы экрана
      if (left < 10) left = 10;
      if (left + popupWidth > viewportWidth - 10) {
        left = viewportWidth - popupWidth - 10;
      }
      
      // Позиция по вертикали - под кнопкой с небольшим отступом
      let top = triggerRect.bottom + 5;
      
      // Если не хватает места снизу, показываем сверху
      if (top + popupHeight > viewportHeight - 10) {
        top = triggerRect.top - popupHeight - 5;
      }
      
      // Ограничиваем минимальную позицию сверху
      if (top < 10) top = 10;
      
      setPosition({ top, left });
    }
  }, [triggerRect]);

  // Закрытие попапа при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Фильтрация значений по поиску
  const filteredValues = values.filter(value =>
    value.toLowerCase().includes(search.toLowerCase())
  );

  // Обработка выбора/снятия выбора
  const toggleValue = (value: string) => {
    setLocalSelected(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  // Выбрать все
  const selectAll = () => {
    setLocalSelected(filteredValues);
  };

  // Снять выделение со всех
  const deselectAll = () => {
    setLocalSelected([]);
  };

  // Применить фильтр
  const handleApply = () => {
    onApply(localSelected);
  };

  // Сбросить фильтр
  const handleReset = () => {
    setLocalSelected([]);
    onApply([]);
  };

  return (
    <div
      ref={popupRef}
      className="fixed z-[100] w-72 bg-white rounded-lg shadow-xl border border-gray-300"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        maxHeight: 'calc(100vh - 40px)'
      }}
    >
      {/* Заголовок попапа */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-800">Фильтр: {columnLabel}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <XIcon size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {selectedValues.length > 0 ? `Выбрано: ${selectedValues.length}` : 'Выберите значения'}
        </p>
      </div>

      {/* Поиск */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
          <MagnifyingGlassIcon
            size={16}
            className="absolute left-2.5 top-2.5 text-gray-400"
          />
        </div>
      </div>

      {/* Управление выделением */}
      <div className="px-3 py-2 border-b border-gray-200 flex justify-between">
        <button
          onClick={selectAll}
          className="text-xs text-indigo-600 hover:text-indigo-800"
        >
          Выбрать все
        </button>
        <button
          onClick={deselectAll}
          className="text-xs text-gray-600 hover:text-gray-800"
        >
          Снять все
        </button>
      </div>

      {/* Список значений с чекбоксами */}
      <div className="overflow-y-auto" style={{ maxHeight: '200px' }}>
        {filteredValues.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            Не найдено
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredValues.map((value, index) => (
              <label
                key={`${value}-${index}`}
                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={localSelected.includes(value)}
                  onChange={() => toggleValue(value)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700 truncate">
                  {value}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Кнопки действий */}
      <div className="p-3 border-t border-gray-200 flex gap-2">
        <button
          onClick={handleReset}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Сбросить
        </button>
        <button
          onClick={handleApply}
          className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Применить
        </button>
      </div>
    </div>
  );
};

export default function UserTable() {
  const [applications, setApplications] = useState<Application[]>([
    { id: 48, direction: "ЦОД", reportRequested: false, reportRequestDate: null, invoiceDate: "2024-01-15", inn: "6623029538", organizationName: "WDLUK Corporation", kfVvPaid: "1 500 000 ₽", kfOdoPaid: "4 500 000 ₽", chvPaid: "10 000 ₽", vstPaid: "5 000 ₽", objectType: "Производство", responsible: "Иванов И.И.", status: "В работе", documentType: "Договор", remarksCount: 3, hasRemarks: true },
    { id: 52, direction: "ССП", reportRequested: true, reportRequestDate: "2024-01-10", invoiceDate: "2024-01-12", inn: "6685151055", organizationName: "Tech Solutions LLC", kfVvPaid: "50 000 ₽", kfOdoPaid: "0 ₽", chvPaid: "5 000 ₽", vstPaid: "5 000 ₽", objectType: "IT-Услуги", responsible: "Петров П.П.", status: "Завершено", documentType: "Счет", remarksCount: 0, hasRemarks: false },
    { id: 57, direction: "ЦОД", reportRequested: false, reportRequestDate: null, invoiceDate: "2024-01-18", inn: "3444068848", organizationName: "Global Impex Ltd", kfVvPaid: "500 000 ₽", kfOdoPaid: "0 ₽", chvPaid: "5 000 ₽", vstPaid: "5 000 ₽", objectType: "Логистика", responsible: "Сидоров С.С.", status: "На проверке", documentType: "Акт", remarksCount: 5, hasRemarks: true },
    { id: 18, direction: "ИГС", reportRequested: true, reportRequestDate: "2024-01-05", invoiceDate: "2024-01-20", inn: "1654003114", organizationName: "СтройКомплекс", kfVvPaid: "500 000 ₽", kfOdoPaid: "350 000 ₽", chvPaid: "5 000 ₽", vstPaid: "5 000 ₽", objectType: "Строительство", responsible: "Кузнецов К.К.", status: "В работе", documentType: "Счет-фактура", remarksCount: 2, hasRemarks: true },
    { id: 29, direction: "ЦОД", reportRequested: false, reportRequestDate: null, invoiceDate: "2024-01-22", inn: "9725021514", organizationName: "ЭнергоСервис", kfVvPaid: "100 000 ₽", kfOdoPaid: "200 000 ₽", chvPaid: "5 000 ₽", vstPaid: "5 000 ₽", objectType: "Энергетика", responsible: "Алексеев А.А.", status: "Завершено", documentType: "Договор", remarksCount: 1, hasRemarks: true },
    { id: 55, direction: "ЦОД", reportRequested: true, reportRequestDate: "2024-01-08", invoiceDate: "2024-01-25", inn: "7727028910", organizationName: "МедТехника", kfVvPaid: "500 000 ₽", kfOdoPaid: "0 ₽", chvPaid: "5 000 ₽", vstPaid: "5 000 ₽", objectType: "Медицина", responsible: "Федоров Ф.Ф.", status: "Отклонено", documentType: "Счет", remarksCount: 4, hasRemarks: true },
    { id: 69, direction: "ИГС", reportRequested: false, reportRequestDate: null, invoiceDate: "2024-01-30", inn: "5100816728", organizationName: "АгроПром", kfVvPaid: "1 000 000 ₽", kfOdoPaid: "3 500 000 ₽", chvPaid: "5 000 ₽", vstPaid: "5 000 ₽", objectType: "Сельское хозяйство", responsible: "Николаев Н.Н.", status: "В работе", documentType: "Договор", remarksCount: 0, hasRemarks: false },
    { id: 68, direction: "ССП", reportRequested: true, reportRequestDate: "2024-01-14", invoiceDate: "2024-01-28", inn: "7231997900", organizationName: "ТрансЛогистик", kfVvPaid: "500 000 ₽", kfOdoPaid: "200 000 ₽", chvPaid: "5 000 ₽", vstPaid: "5 000 ₽", objectType: "Транспорт", responsible: "Дмитриев Д.Д.", status: "На проверке", documentType: "Акт", remarksCount: 3, hasRemarks: true },
    { id: 60, direction: "ЦОД", reportRequested: false, reportRequestDate: null, invoiceDate: "2024-02-01", inn: "080301405340", organizationName: "Инновации Техно", kfVvPaid: "500 000 ₽", kfOdoPaid: "0 ₽", chvPaid: "5 000 ₽", vstPaid: "5 000 ₽", objectType: "Научные исследования", responsible: "Олегов О.О.", status: "На доработке", documentType: "Счет-фактура", remarksCount: 6, hasRemarks: true },
    { id: 50, direction: "ИГС", reportRequested: true, reportRequestDate: "2024-01-17", invoiceDate: "2024-02-03", inn: "6707070544", organizationName: "Горнодобывающий комплекс", kfVvPaid: "500 000 ₽", kfOdoPaid: "200 000 ₽", chvPaid: "5 000 ₽", vstPaid: "5 000 ₽", objectType: "Добыча полезных ископаемых", responsible: "Романов Р.Р.", status: "В работе", documentType: "Договор", remarksCount: 2, hasRemarks: true },
  ]);

  const [filters, setFilters] = useState({
    search: "",
    direction: "",
    status: "",
    objectType: ""
  });

  const [showClosed, setShowClosed] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [filterPopup, setFilterPopup] = useState<{
    columnKey: string;
    columnLabel: string;
    values: string[];
    triggerRect: DOMRect | null;
  } | null>(null);
  
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Фильтры по столбцам
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});

  // Обработчик клавиш для скролла
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const container = tableContainerRef.current;
      if (!container) return;

      const scrollAmount = 50;
      const pageScrollAmount = container.clientHeight * 0.8;

      switch (e.key) {
        case 'ArrowLeft':
          container.scrollLeft -= scrollAmount;
          e.preventDefault();
          break;
        case 'ArrowRight':
          container.scrollLeft += scrollAmount;
          e.preventDefault();
          break;
        case 'ArrowUp':
          container.scrollTop -= scrollAmount;
          e.preventDefault();
          break;
        case 'ArrowDown':
          container.scrollTop += scrollAmount;
          e.preventDefault();
          break;
        case 'PageUp':
          container.scrollTop -= pageScrollAmount;
          e.preventDefault();
          break;
        case 'PageDown':
          container.scrollTop += pageScrollAmount;
          e.preventDefault();
          break;
        case 'Home':
          if (e.ctrlKey) {
            container.scrollTop = 0;
          } else {
            container.scrollLeft = 0;
          }
          e.preventDefault();
          break;
        case 'End':
          if (e.ctrlKey) {
            container.scrollTop = container.scrollHeight;
          } else {
            container.scrollLeft = container.scrollWidth;
          }
          e.preventDefault();
          break;
        case '?':
          if (e.shiftKey) {
            setShowKeyboardHelp(!showKeyboardHelp);
            e.preventDefault();
          }
          break;
        case 'Escape':
          setShowKeyboardHelp(false);
          setFilterPopup(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showKeyboardHelp]);

  // Открытие попапа фильтра
  const openFilterPopup = (columnKey: string, columnLabel: string, event: React.MouseEvent) => {
    // Собираем уникальные значения для столбца
    let values: string[] = [];
    
    switch (columnKey) {
      case 'id':
        values = Array.from(new Set(applications.map(app => app.id.toString())));
        break;
      case 'direction':
        values = Array.from(new Set(applications.map(app => app.direction)));
        break;
      case 'reportRequested':
        values = ['Запрошен', 'Не запрошен'];
        break;
      case 'invoiceDate':
        values = Array.from(new Set(applications.map(app => app.invoiceDate)));
        break;
      case 'inn':
        values = Array.from(new Set(applications.map(app => app.inn)));
        break;
      case 'organizationName':
        values = Array.from(new Set(applications.map(app => app.organizationName)));
        break;
      case 'kfVvPaid':
        values = Array.from(new Set(applications.map(app => app.kfVvPaid)));
        break;
      case 'kfOdoPaid':
        values = Array.from(new Set(applications.map(app => app.kfOdoPaid)));
        break;
      case 'chvPaid':
        values = Array.from(new Set(applications.map(app => app.chvPaid)));
        break;
      case 'vstPaid':
        values = Array.from(new Set(applications.map(app => app.vstPaid)));
        break;
      case 'objectType':
        values = Array.from(new Set(applications.map(app => app.objectType)));
        break;
      case 'responsible':
        values = Array.from(new Set(applications.map(app => app.responsible)));
        break;
      case 'status':
        values = Array.from(new Set(applications.map(app => app.status)));
        break;
      case 'documentType':
        values = Array.from(new Set(applications.map(app => app.documentType)));
        break;
      case 'hasRemarks':
        values = ['Есть замечания', 'Нет замечаний'];
        break;
      default:
        values = [];
    }

    // Получаем координаты кнопки для позиционирования попапа
    const triggerRect = (event.currentTarget as HTMLElement).getBoundingClientRect();

    setFilterPopup({
      columnKey,
      columnLabel,
      values,
      triggerRect
    });
  };

  // Применение фильтра по столбцу
  const applyColumnFilter = (columnKey: string, selectedValues: string[]) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: selectedValues
    }));
    setFilterPopup(null);
  };

  // Фильтрация заявок с учетом фильтров по столбцам
  const filteredApplications = applications.filter(app => {
    // Основные фильтры
    const matchesSearch = !filters.search || 
      app.id.toString().includes(filters.search) ||
      app.direction.toLowerCase().includes(filters.search.toLowerCase()) ||
      app.inn.includes(filters.search) ||
      app.organizationName.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesDirection = !filters.direction || app.direction === filters.direction;
    const matchesStatus = !filters.status || app.status === filters.status;
    const matchesObjectType = !filters.objectType || app.objectType === filters.objectType;
    const matchesClosed = showClosed || app.status !== "Завершено";

    // Фильтры по столбцам
    const matchesColumnFilters = Object.entries(columnFilters).every(([columnKey, selectedValues]) => {
      if (selectedValues.length === 0) return true;
      
      let value: string = '';
      switch (columnKey) {
        case 'id':
          value = app.id.toString();
          break;
        case 'direction':
          value = app.direction;
          break;
        case 'status':
          value = app.status;
          break;
        case 'objectType':
          value = app.objectType;
          break;
        case 'responsible':
          value = app.responsible;
          break;
        case 'documentType':
          value = app.documentType;
          break;
        case 'organizationName':
          value = app.organizationName;
          break;
        case 'reportRequested':
          value = app.reportRequested ? 'Запрошен' : 'Не запрошен';
          break;
        case 'hasRemarks':
          value = app.hasRemarks ? 'Есть замечания' : 'Нет замечаний';
          break;
        case 'invoiceDate':
          value = app.invoiceDate;
          break;
        case 'inn':
          value = app.inn;
          break;
        case 'kfVvPaid':
          value = app.kfVvPaid;
          break;
        case 'kfOdoPaid':
          value = app.kfOdoPaid;
          break;
        case 'chvPaid':
          value = app.chvPaid;
          break;
        case 'vstPaid':
          value = app.vstPaid;
          break;
        default:
          return true;
      }
      
      return selectedValues.includes(value);
    });

    return matchesSearch && matchesDirection && matchesStatus && 
           matchesObjectType && matchesClosed && matchesColumnFilters;
  });

  const directions = Array.from(new Set(applications.map(app => app.direction)));
  const statuses = Array.from(new Set(applications.map(app => app.status)));
  const objectTypes = Array.from(new Set(applications.map(app => app.objectType)));

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage);

  // Цвета для направлений
  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case "ЦОД": return "bg-blue-100 text-blue-800";
      case "ССП": return "bg-green-100 text-green-800";
      case "ИГС": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Цвета для типов объектов
  const getObjectTypeColor = (objectType: string) => {
    switch (objectType) {
      case "Производство": return "bg-purple-100 text-purple-800";
      case "IT-Услуги": return "bg-indigo-100 text-indigo-800";
      case "Логистика": return "bg-yellow-100 text-yellow-800";
      case "Строительство": return "bg-red-100 text-red-800";
      case "Энергетика": return "bg-teal-100 text-teal-800";
      case "Медицина": return "bg-pink-100 text-pink-800";
      case "Сельское хозяйство": return "bg-lime-100 text-lime-800";
      case "Транспорт": return "bg-cyan-100 text-cyan-800";
      case "Научные исследования": return "bg-amber-100 text-amber-800";
      case "Добыча полезных ископаемых": return "bg-brown-100 text-brown-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Иконки статусов
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Завершено": return <CheckCircleIcon className="text-green-500" size={16} />;
      case "Отклонено": return <XCircleIcon className="text-red-500" size={16} />;
      case "В работе": return <ClockIcon className="text-blue-500" size={16} />;
      case "На проверке": return <FileTextIcon className="text-yellow-500" size={16} />;
      case "На доработке": return <WarningIcon className="text-orange-500" size={16} />;
      default: return <ClockIcon className="text-gray-500" size={16} />;
    }
  };

  // Цвета статусов
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Завершено": return "bg-green-100 text-green-800";
      case "Отклонено": return "bg-red-100 text-red-800";
      case "В работе": return "bg-blue-100 text-blue-800";
      case "На проверке": return "bg-yellow-100 text-yellow-800";
      case "На доработке": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Запрос отчета
  const requestReport = (id: number) => {
    setApplications(prev => prev.map(app => 
      app.id === id 
        ? { ...app, reportRequested: true, reportRequestDate: new Date().toISOString().split('T')[0] }
        : app
    ));
  };

  // Проверка активного фильтра по столбцу
  const hasActiveColumnFilter = (columnKey: string) => {
    return columnFilters[columnKey] && columnFilters[columnKey].length > 0;
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Заголовок и статистика */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-3">
          <div>
            <p className="text-sm text-gray-600 mt-1">Всего заявок: {filteredApplications.length}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm">
              <PlusIcon size={16} />
              <span>Новая заявка</span>
            </button>
            <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm">
              <MicrosoftExcelLogoIcon size={16} />
              <span>Excel</span>
            </button>
          </div>
        </div>

        {/* Помощь по клавиатуре */}
        {showKeyboardHelp && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-blue-800">Управление скроллом с клавиатуры</h3>
              <button 
                onClick={() => setShowKeyboardHelp(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">←</kbd>
                <span>Влево</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">→</kbd>
                <span>Вправо</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">↑</kbd>
                <span>Вверх</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">↓</kbd>
                <span>Вниз</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">PgUp</kbd>
                <span>Страница вверх</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">PgDn</kbd>
                <span>Страница вниз</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Home</kbd>
                <span>В начало</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">End</kbd>
                <span>В конец</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-blue-600">
              Нажмите <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">Shift + ?</kbd> чтобы показать/скрыть эту подсказку
            </div>
          </div>
        )}

        {/* Фильтры и поиск */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Поиск..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon size={16} className="text-gray-400" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={filters.direction}
              onChange={(e) => setFilters(prev => ({ ...prev, direction: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm min-w-[120px]"
            >
              <option value="">Все направления</option>
              {directions.map(dir => (
                <option key={dir} value={dir}>{dir}</option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm min-w-[120px]"
            >
              <option value="">Все статусы</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <select
              value={filters.objectType}
              onChange={(e) => setFilters(prev => ({ ...prev, objectType: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm min-w-[140px]"
            >
              <option value="">Типы объектов</option>
              {objectTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Панель управления */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setShowClosed(!showClosed)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm ${showClosed ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <EyeClosedIcon size={14} />
            <span>{showClosed ? 'Скрыть закрытые' : 'Показать закрытые'}</span>
          </button>
          <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-100 rounded-lg text-sm">
            <ListIcon size={14} />
            <span>Страница {page} из {totalPages}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>Показывать:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded bg-white text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        <div className="text-xs sm:text-sm text-gray-600">
          Показано {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredApplications.length)} из {filteredApplications.length}
        </div>
      </div>

      {/* Таблица с уменьшенными столбцами и скроллом */}
      <div 
        ref={tableContainerRef}
        className="overflow-auto max-h-[500px] focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-inset relative"
        tabIndex={0}
      >
        <table 
          ref={tableRef}
          className="w-full min-w-[1300px]"
        >
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {/* 1. № заявки */}
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[70px]">
                <div className="flex items-center gap-1">
                  <span>№</span>
                  <button
                    onClick={(e) => openFilterPopup('id', '№ заявки', e)}
                    className={`ml-1 ${hasActiveColumnFilter('id') ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <FunnelIcon size={12} />
                  </button>
                </div>
              </th>

              {/* 2. Направление */}
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[100px]">
                <div className="flex items-center gap-1">
                  <span>Направление</span>
                  <button
                    onClick={(e) => openFilterPopup('direction', 'Направление', e)}
                    className={`ml-1 ${hasActiveColumnFilter('direction') ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <FunnelIcon size={12} />
                  </button>
                </div>
              </th>

              {/* 3. Запрос отчетов */}
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[120px]">
                <div className="flex items-center gap-1">
                  <span>Отчеты</span>
                  <button
                    onClick={(e) => openFilterPopup('reportRequested', 'Запрос отчетов', e)}
                    className={`ml-1 ${hasActiveColumnFilter('reportRequested') ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <FunnelIcon size={12} />
                  </button>
                </div>
              </th>

              {/* 4. Дата выставления счета */}
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[90px]">
                <div className="flex items-center gap-1">
                  <span>Дата счета</span>
                  <button
                    onClick={(e) => openFilterPopup('invoiceDate', 'Дата счета', e)}
                    className={`ml-1 ${hasActiveColumnFilter('invoiceDate') ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <FunnelIcon size={12} />
                  </button>
                </div>
              </th>

              {/* 5. Скачать счет */}
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[60px]">
                <span>Счет</span>
              </th>

              {/* 6. ИНН */}
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[100px]">
                <div className="flex items-center gap-1">
                  <span>ИНН</span>
                  <button
                    onClick={(e) => openFilterPopup('inn', 'ИНН', e)}
                    className={`ml-1 ${hasActiveColumnFilter('inn') ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <FunnelIcon size={12} />
                  </button>
                </div>
              </th>

              {/* 7. Наименование организации */}
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[140px]">
                <div className="flex items-center gap-1">
                  <span>Организация</span>
                  <button
                    onClick={(e) => openFilterPopup('organizationName', 'Организация', e)}
                    className={`ml-1 ${hasActiveColumnFilter('organizationName') ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <FunnelIcon size={12} />
                  </button>
                </div>
              </th>

              {/* 8. КФ ВВ Оплачено */}
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[90px]">
                <div className="flex items-center gap-1">
                  <span>КФ ВВ</span>
                  <button
                    onClick={(e) => openFilterPopup('kfVvPaid', 'КФ ВВ Оплачено', e)}
                    className={`ml-1 ${hasActiveColumnFilter('kfVvPaid') ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <FunnelIcon size={12} />
                  </button>
                </div>
              </th>

              {/* 9. КФ ОДО Оплачено */}
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[90px]">
                <div className="flex items-center gap-1">
                  <span>КФ ОДО</span>
                  <button
                    onClick={(e) => openFilterPopup('kfOdoPaid', 'КФ ОДО Оплачено', e)}
                    className={`ml-1 ${hasActiveColumnFilter('kfOdoPaid') ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <FunnelIcon size={12} />
                  </button>
                </div>
              </th>

              {/* 10. ЧВ Оплачено */}
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[80px]">
                <div className="flex items-center gap-1">
                  <span>ЧВ</span>
                  <button
                    onClick={(e) => openFilterPopup('chvPaid', 'ЧВ Оплачено', e)}
                    className={`ml-1 ${hasActiveColumnFilter('chvPaid') ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <FunnelIcon size={12} />
                  </button>
                </div>
              </th>

              {/* 11. ВСТ Оплачено */}
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[80px]">
                <div className="flex items-center gap-1">
                  <span>ВСТ</span>
                  <button
                    onClick={(e) => openFilterPopup('vstPaid', 'ВСТ Оплачено', e)}
                    className={`ml-1 ${hasActiveColumnFilter('vstPaid') ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <FunnelIcon size={12} />
                  </button>
                </div>
              </th>

              {/* 12. Тип Объекта */}
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[120px]">
                <div className="flex items-center gap-1">
                  <span>Тип объекта</span>
                  <button
                    onClick={(e) => openFilterPopup('objectType', 'Тип объекта', e)}
                    className={`ml-1 ${hasActiveColumnFilter('objectType') ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <FunnelIcon size={12} />
                  </button>
                </div>
              </th>

              {/* 13. Ответственный */}
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[110px]">
                <div className="flex items-center gap-1">
                  <span>Ответственный</span>
                  <button
                    onClick={(e) => openFilterPopup('responsible', 'Ответственный', e)}
                    className={`ml-1 ${hasActiveColumnFilter('responsible') ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <FunnelIcon size={12} />
                  </button>
                </div>
              </th>

              {/* 14. Статус заявки */}
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[110px]">
                <div className="flex items-center gap-1">
                  <span>Статус</span>
                  <button
                    onClick={(e) => openFilterPopup('status', 'Статус', e)}
                    className={`ml-1 ${hasActiveColumnFilter('status') ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <FunnelIcon size={12} />
                  </button>
                </div>
              </th>

              {/* 15. Тип документа с замечаниями */}
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[130px]">
                <div className="flex items-center gap-1">
                  <span>Тип документа</span>
                  <button
                    onClick={(e) => openFilterPopup('documentType', 'Тип документа', e)}
                    className={`ml-1 ${hasActiveColumnFilter('documentType') ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <FunnelIcon size={12} />
                  </button>
                </div>
              </th>

              {/* 16. Скачать замечания */}
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[80px]">
                <div className="flex items-center gap-1">
                  <span>Замечания</span>
                  <button
                    onClick={(e) => openFilterPopup('hasRemarks', 'Замечания', e)}
                    className={`ml-1 ${hasActiveColumnFilter('hasRemarks') ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <FunnelIcon size={12} />
                  </button>
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {paginatedApplications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                {/* 1. № заявки */}
                <td className="px-2 py-2 whitespace-nowrap">
                  <span className="font-bold text-gray-900 text-sm">{app.id}</span>
                </td>

                {/* 2. Направление (с цветовым кодированием) */}
                <td className="px-2 py-2 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDirectionColor(app.direction)}`}>
                    {app.direction}
                  </span>
                </td>

                {/* 3. Запрос отчетов */}
                <td className="px-2 py-2 whitespace-nowrap">
                  {app.reportRequested ? (
                    <div className="text-xs">
                      <div className="text-green-600 font-medium">Запрошен</div>
                      <div className="text-gray-500">{app.reportRequestDate}</div>
                    </div>
                  ) : (
                    <button
                      onClick={() => requestReport(app.id)}
                      className="px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-xs font-medium transition-colors w-full text-center"
                    >
                      Запросить
                    </button>
                  )}
                </td>

                {/* 4. Дата выставления счета */}
                <td className="px-2 py-2 whitespace-nowrap text-gray-900 font-medium text-sm">
                  {app.invoiceDate}
                </td>

                {/* 5. Скачать счет (иконка) */}
                <td className="px-2 py-2 whitespace-nowrap">
                  <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                    <DownloadSimpleIcon size={16} />
                  </button>
                </td>

                {/* 6. ИНН */}
                <td className="px-2 py-2 whitespace-nowrap text-gray-900 font-mono text-xs">
                  {app.inn}
                </td>

                {/* 7. Наименование организации */}
                <td className="px-2 py-2 whitespace-nowrap text-gray-900 text-sm">
                  <div className="flex items-center gap-1">
                    <BuildingIcon size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{app.organizationName}</span>
                  </div>
                </td>

                {/* 8. КФ ВВ Оплачено */}
                <td className="px-2 py-2 whitespace-nowrap text-gray-900 font-medium text-sm text-right">
                  {app.kfVvPaid}
                </td>

                {/* 9. КФ ОДО Оплачено */}
                <td className="px-2 py-2 whitespace-nowrap text-gray-900 font-medium text-sm text-right">
                  {app.kfOdoPaid}
                </td>

                {/* 10. ЧВ Оплачено */}
                <td className="px-2 py-2 whitespace-nowrap text-gray-900 font-medium text-sm text-right">
                  {app.chvPaid}
                </td>

                {/* 11. ВСТ Оплачено */}
                <td className="px-2 py-2 whitespace-nowrap text-gray-900 font-medium text-sm text-right">
                  {app.vstPaid}
                </td>

                {/* 12. Тип Объекта (с цветовым кодированием) */}
                <td className="px-2 py-2 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getObjectTypeColor(app.objectType)}`}>
                    <span className="truncate">{app.objectType}</span>
                  </span>
                </td>

                {/* 13. Ответственный */}
                <td className="px-2 py-2 whitespace-nowrap text-gray-900 text-sm">
                  <div className="flex items-center gap-1">
                    <UserIcon size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{app.responsible}</span>
                  </div>
                </td>

                {/* 14. Статус заявки */}
                <td className="px-2 py-2 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    {getStatusIcon(app.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                </td>

                {/* 15. Тип документа с замечаниями */}
                <td className="px-2 py-2 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <FileIcon size={14} className={app.hasRemarks ? "text-orange-500 flex-shrink-0" : "text-green-500 flex-shrink-0"} />
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate">{app.documentType}</div>
                      <div className={`text-xs ${app.hasRemarks ? 'text-orange-600' : 'text-green-600'}`}>
                        {app.hasRemarks ? `${app.remarksCount} зам.` : 'Нет зам.'}
                      </div>
                    </div>
                  </div>
                </td>

                {/* 16. Скачать замечания */}
                <td className="px-2 py-2 whitespace-nowrap">
                  {app.hasRemarks ? (
                    <button className="p-1 text-orange-400 hover:text-orange-600 transition-colors">
                      <FilePdfIcon size={16} />
                    </button>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs sm:text-sm text-gray-700">
          Показано <span className="font-medium">{startIndex + 1}</span> -{" "}
          <span className="font-medium">
            {Math.min(startIndex + itemsPerPage, filteredApplications.length)}
          </span>{" "}
          из <span className="font-medium">{filteredApplications.length}</span> заявок
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-2 py-1.5 rounded-lg border text-sm ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
          >
            <ArrowLeftIcon size={14} />
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-3 py-1.5 rounded-lg border text-sm ${page === pageNum ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-2 py-1.5 rounded-lg border text-sm ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
          >
            <ArrowRightIcon size={14} />
          </button>
        </div>
      </div>

      {/* Попап фильтра - рендерится поверх всего */}
      {filterPopup && (
        <FilterPopup
          columnKey={filterPopup.columnKey}
          columnLabel={filterPopup.columnLabel}
          values={filterPopup.values}
          selectedValues={columnFilters[filterPopup.columnKey] || []}
          onApply={(selected) => applyColumnFilter(filterPopup.columnKey, selected)}
          onClose={() => setFilterPopup(null)}
          triggerRect={filterPopup.triggerRect}
        />
      )}
    </div>
  );
}