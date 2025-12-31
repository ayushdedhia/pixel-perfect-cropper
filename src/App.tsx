import { useEffect, useRef, useState } from "react";
import { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { toast, Toaster } from "sonner";

import { CropCanvas } from "./components/CropCanvas";
import { Header } from "./components/Header";
import { PremiumModal } from "./components/PremiumModal";
import { Sidebar } from "./components/sidebar/Sidebar";
import { StatusBar } from "./components/StatusBar";
import { UploadArea } from "./components/UploadArea";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { EXPORT_INITIAL_STATE, FILTERS_INITIAL_STATE } from "./constants";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import type { Area, ExportConfig, ImageFilters } from "./types";
import { getCroppedImg } from "./utils/image-utils";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function MainApp() {
  const { user } = useAuth();
  const isPremium = user?.isPremium ?? false;

  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);

  const [filters, setFilters] = useState<ImageFilters>(FILTERS_INITIAL_STATE);
  const [exportConfig, setExportConfig] = useState<ExportConfig>(EXPORT_INITIAL_STATE);
  const [history, setHistory] = useState<ImageFilters[]>([]);

  const [isCopying, setIsCopying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, aspect || 1, width, height),
      width,
      height
    );
    if (!aspect) {
      setCrop({ unit: "%", width: 90, height: 90, x: 5, y: 5 });
    } else {
      setCrop(initialCrop);
    }
  }

  useEffect(() => {
    if (imgRef.current && aspect) {
      const { width, height } = imgRef.current;
      const newCrop = centerCrop(
        makeAspectCrop({ unit: "%", width: 90 }, aspect, width, height),
        width,
        height
      );
      setCrop(newCrop);
    }
  }, [aspect]);

  const handleImageLoad = (dataUrl: string) => {
    setImage(dataUrl);
    resetState();
  };

  const resetState = () => {
    setAspect(undefined);
    setFilters(FILTERS_INITIAL_STATE);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setHistory([]);
    setExportConfig(EXPORT_INITIAL_STATE);
  };

  const updateFilters = (newFilters: Partial<ImageFilters>) => {
    setHistory((prev) => [...prev.slice(-15), filters]);
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const undoFilter = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setFilters(prev);
      setHistory(history.slice(0, -1));
    }
  };

  const handleDownload = async () => {
    if (!image || !completedCrop || !imgRef.current) return;
    setIsDownloading(true);
    try {
      const area: Area = {
        x: completedCrop.x,
        y: completedCrop.y,
        width: completedCrop.width,
        height: completedCrop.height,
      };
      const displaySize = { width: imgRef.current.width, height: imgRef.current.height };
      const blob = await getCroppedImg(image, area, filters, displaySize, exportConfig, isPremium);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const ext = exportConfig.format.split("/")[1];
      link.download = `pixelperfect-${Date.now()}.${ext}`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!image || !completedCrop || !imgRef.current) return;
    setIsCopying(true);
    try {
      const area: Area = {
        x: completedCrop.x,
        y: completedCrop.y,
        width: completedCrop.width,
        height: completedCrop.height,
      };
      const displaySize = { width: imgRef.current.width, height: imgRef.current.height };
      const blob = await getCroppedImg(
        image,
        area,
        filters,
        displaySize,
        { ...exportConfig, format: "image/png" },
        isPremium
      );
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast.success("Copied PNG to clipboard!");
    } catch (e) {
      console.error(e);
      toast.error("Clipboard copy failed. Try downloading instead.");
    } finally {
      setIsCopying(false);
    }
  };

  const handleCircularChange = (circular: boolean) => {
    setExportConfig((prev) => ({ ...prev, circular }));
  };

  const handleExportConfigChange = (config: Partial<ExportConfig>) => {
    setExportConfig((prev) => ({ ...prev, ...config }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 overflow-hidden text-slate-200">
      <Header
        image={image}
        imageWidth={imgRef.current?.naturalWidth}
        imageHeight={imgRef.current?.naturalHeight}
        onClear={() => setImage(null)}
        onOpenPremiumModal={() => setShowPremiumModal(true)}
      />

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {!image ? (
          <UploadArea onImageLoad={handleImageLoad} />
        ) : (
          <>
            <div className="flex-1 relative bg-slate-950 flex flex-col min-h-0">
              <CropCanvas
                ref={imgRef}
                image={image}
                crop={crop}
                completedCrop={completedCrop}
                aspect={aspect}
                circular={exportConfig.circular}
                filters={filters}
                onCropChange={setCrop}
                onCropComplete={setCompletedCrop}
                onImageLoad={onImageLoad}
              />
              <StatusBar
                aspect={aspect}
                completedCrop={completedCrop}
                exportConfig={exportConfig}
              />
            </div>

            <Sidebar
              aspect={aspect}
              filters={filters}
              exportConfig={exportConfig}
              historyLength={history.length}
              isDownloading={isDownloading}
              isCopying={isCopying}
              canExport={!!completedCrop}
              isPremium={isPremium}
              onAspectChange={setAspect}
              onCircularChange={handleCircularChange}
              onUpdateFilters={updateFilters}
              onUndo={undoFilter}
              onExportConfigChange={handleExportConfigChange}
              onDownload={handleDownload}
              onCopyToClipboard={handleCopyToClipboard}
              onShowPremiumModal={() => setShowPremiumModal(true)}
            />
          </>
        )}
      </main>

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
}

function AppRoutes() {
  return (
    <>
      <Toaster theme="dark" position="bottom-center" richColors className="font-sans!" />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
