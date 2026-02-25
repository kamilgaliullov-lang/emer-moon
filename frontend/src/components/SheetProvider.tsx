import React, { createContext, useContext, useRef, useState, useCallback, useMemo } from 'react';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import BSList from './sheets/BSList';
import BSObject from './sheets/BSObject';
import BSCreate from './sheets/BSCreate';
import BSSettings from './sheets/BSSettings';
import BSChat from './sheets/BSChat';
import BSDocs from './sheets/BSDocs';
import BSMap from './sheets/BSMap';
import { COLORS, RADIUS } from '../utils/constants';
import type { Obj, ListFilter, MapOptions } from '../utils/types';

interface SheetContextType {
  openList: (filter: ListFilter) => void;
  openObject: (obj: Obj) => void;
  openCreate: (editObj?: Obj | null) => void;
  openSettings: () => void;
  openMap: (options?: MapOptions) => void;
  openChat: () => void;
  openDocs: () => void;
}

const SheetContext = createContext<SheetContextType>({
  openList: () => {},
  openObject: () => {},
  openCreate: () => {},
  openSettings: () => {},
  openMap: () => {},
  openChat: () => {},
  openDocs: () => {},
});

export const useSheet = () => useContext(SheetContext);

export function SheetProvider({ children }: { children: React.ReactNode }) {
  const listRef = useRef<BottomSheetModal>(null);
  const objectRef = useRef<BottomSheetModal>(null);
  const createRef = useRef<BottomSheetModal>(null);
  const settingsRef = useRef<BottomSheetModal>(null);
  const mapRef = useRef<BottomSheetModal>(null);
  const chatRef = useRef<BottomSheetModal>(null);
  const docsRef = useRef<BottomSheetModal>(null);

  const [listFilter, setListFilter] = useState<ListFilter>({ title: '' });
  const [selectedObj, setSelectedObj] = useState<Obj | null>(null);
  const [editObj, setEditObj] = useState<Obj | null>(null);
  const [mapOptions, setMapOptions] = useState<MapOptions>({});

  const openList = useCallback((filter: ListFilter) => {
    setListFilter(filter);
    listRef.current?.present();
  }, []);

  const openObject = useCallback((obj: Obj) => {
    setSelectedObj(obj);
    objectRef.current?.present();
  }, []);

  const openCreate = useCallback((edit?: Obj | null) => {
    setEditObj(edit || null);
    createRef.current?.present();
  }, []);

  const openSettings = useCallback(() => {
    settingsRef.current?.present();
  }, []);

  const openMap = useCallback((options?: MapOptions) => {
    setMapOptions(options || {});
    mapRef.current?.present();
  }, []);

  const openChat = useCallback(() => {
    chatRef.current?.present();
  }, []);

  const openDocs = useCallback(() => {
    docsRef.current?.present();
  }, []);

  const contextValue = useMemo(
    () => ({ openList, openObject, openCreate, openSettings, openMap, openChat, openDocs }),
    [openList, openObject, openCreate, openSettings, openMap, openChat, openDocs]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
    ),
    []
  );

  const listSnap = useMemo(() => ['85%'], []);
  const fullSnap = useMemo(() => ['92%'], []);

  const sheetStyle = {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.sheet,
    borderTopRightRadius: RADIUS.sheet,
  };
  const handleStyle = { backgroundColor: COLORS.textTertiary, width: 40 };

  return (
    <SheetContext.Provider value={contextValue}>
      {children}

      <BottomSheetModal
        ref={listRef}
        snapPoints={listSnap}
        backdropComponent={renderBackdrop}
        enableDynamicSizing={false}
        backgroundStyle={sheetStyle}
        handleIndicatorStyle={handleStyle}
      >
        <BSList filter={listFilter} />
      </BottomSheetModal>

      <BottomSheetModal
        ref={objectRef}
        snapPoints={fullSnap}
        backdropComponent={renderBackdrop}
        enableDynamicSizing={false}
        backgroundStyle={sheetStyle}
        handleIndicatorStyle={handleStyle}
      >
        <BSObject obj={selectedObj} />
      </BottomSheetModal>

      <BottomSheetModal
        ref={createRef}
        snapPoints={fullSnap}
        backdropComponent={renderBackdrop}
        enableDynamicSizing={false}
        backgroundStyle={sheetStyle}
        handleIndicatorStyle={handleStyle}
      >
        <BSCreate editObj={editObj} onDismiss={() => createRef.current?.dismiss()} />
      </BottomSheetModal>

      <BottomSheetModal
        ref={settingsRef}
        snapPoints={fullSnap}
        backdropComponent={renderBackdrop}
        enableDynamicSizing={false}
        backgroundStyle={sheetStyle}
        handleIndicatorStyle={handleStyle}
      >
        <BSSettings onDismiss={() => settingsRef.current?.dismiss()} />
      </BottomSheetModal>

      <BottomSheetModal
        ref={mapRef}
        snapPoints={fullSnap}
        backdropComponent={renderBackdrop}
        enableDynamicSizing={false}
        backgroundStyle={sheetStyle}
        handleIndicatorStyle={handleStyle}
      >
        <BSMap options={mapOptions} onDismiss={() => mapRef.current?.dismiss()} />
      </BottomSheetModal>

      <BottomSheetModal
        ref={chatRef}
        snapPoints={fullSnap}
        backdropComponent={renderBackdrop}
        enableDynamicSizing={false}
        backgroundStyle={sheetStyle}
        handleIndicatorStyle={handleStyle}
      >
        <BSChat />
      </BottomSheetModal>

      <BottomSheetModal
        ref={docsRef}
        snapPoints={listSnap}
        backdropComponent={renderBackdrop}
        enableDynamicSizing={false}
        backgroundStyle={sheetStyle}
        handleIndicatorStyle={handleStyle}
      >
        <BSDocs />
      </BottomSheetModal>
    </SheetContext.Provider>
  );
}
