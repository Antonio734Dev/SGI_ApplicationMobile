import React, { useEffect, useState, useMemo, useRef, forwardRef, useImperativeHandle } from 'react'
import { Text, View, TouchableOpacity, Platform, Dimensions, Image, StyleSheet, Alert } from 'react-native'
import { useRoute, useFocusEffect } from '@react-navigation/native'
import ScrollableLayout from '../../layouts/ScrollableLayout'
import { Accordion, Button, RadioGroup, ScrollShadow, Spinner, TextField, useTheme } from 'heroui-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { formatDateLiteral } from '../../utils/utils'
import { Modalize } from 'react-native-modalize'
import { ScrollView } from 'react-native-gesture-handler'
import { required, validPositiveNumber, validDate } from '../../utils/validators'
import { CameraView, useCameraPermissions } from 'expo-camera'

// SOLUCIÓN: Imports estáticos aquí arriba
import * as FileSystem from 'expo-file-system/legacy'
import * as MediaLibrary from 'expo-media-library'
import * as Sharing from 'expo-sharing'

// Servicios
import { getProducts, createProduct, getStockCatalogues, getProductStatuses, getQrCodeImage, getProductByQrHash } from '../../services/product'

const { height } = Dimensions.get('window')
const MODAL_MAX_HEIGHT = height * 0.75
const OVERLAY_STYLE = { backgroundColor: 'rgba(0, 0, 0, 0.4)' }

const MODAL_ANIMATION_PROPS = {
    openAnimationConfig: { timing: { duration: 450 } },
    closeAnimationConfig: { timing: { duration: 300 } },
    dragToss: 0.05,
    threshold: 120,
    useNativeDriver: true,
    adjustToContentHeight: true,
    avoidKeyboardLikeIOS: true,
    overlayStyle: OVERLAY_STYLE,
    handlePosition: 'inside',
}

const InfoRow = ({ label, value, valueClassName = '' }) => (
    <View className="flex-row items-start justify-between">
        <Text className="text-[14px] text-muted-foreground w-24 pt-0.5">{label}</Text>
        <Text className={`text-[14px] text-right flex-1 font-medium ${valueClassName ? valueClassName : 'text-foreground'}`} numberOfLines={2}>
            {value}
        </Text>
    </View>
)

// =====================================================================
// CUSTOM ALERT
// =====================================================================
const CustomAlert = forwardRef((_, ref) => {
    const { colors } = useTheme()
    const modalRef = useRef(null)
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'success',
    })

    useImperativeHandle(ref, () => ({
        show: (title, message, type = 'success') => {
            setAlertConfig({ title, message, type })
            modalRef.current?.open()
        },
        close: () => {
            modalRef.current?.close()
        },
    }))

    const getConfig = () => {
        switch (alertConfig.type) {
            case 'error':
                return { icon: 'alert-outline', color: colors.danger, bgIcon: 'bg-danger/10' }
            case 'warning':
                return { icon: 'warning-outline', color: colors.warning, bgIcon: 'bg-warning/10' }
            case 'success':
            default:
                return { icon: 'checkmark-outline', color: colors.accent, bgIcon: 'bg-accent/10' }
        }
    }

    const config = getConfig()

    return (
        <Modalize ref={modalRef} {...MODAL_ANIMATION_PROPS} modalStyle={{ backgroundColor: colors.background }}>
            <View style={{ maxHeight: MODAL_MAX_HEIGHT }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingHorizontal: '6%', paddingTop: '9%', paddingBottom: '6%' }}
                >
                    <View className="flex flex-col items-center justify-center">
                        <View className={`h-16 w-16 rounded-full items-center justify-center mb-4 ${config.bgIcon}`}>
                            <Ionicons name={config.icon} size={32} color={config.color} />
                        </View>
                        <Text className="text-foreground text-2xl font-medium mb-2 text-center">{alertConfig.title}</Text>
                        <Text className="text-muted-foreground text-center px-4 mb-8">{alertConfig.message}</Text>
                        <Button
                            onPress={() => modalRef.current?.close()}
                            className={
                                alertConfig.type === 'warning'
                                    ? 'bg-warning w-full text-warning-foreground'
                                    : alertConfig.type === 'error'
                                      ? 'bg-danger w-full text-danger-foreground'
                                      : 'bg-accent w-full text-accent-foreground'
                            }
                        >
                            <Button.Label>Entendido</Button.Label>
                        </Button>
                    </View>
                </ScrollView>
            </View>
        </Modalize>
    )
})

// =====================================================================
// MODAL DE FILTROS
// =====================================================================
const FiltersModalContent = ({
    modalRef,
    sortOption,
    setSortOption,
    catalogueFilter,
    setCatalogueFilter,
    statusFilter,
    setStatusFilter,
    rowsPerPage,
    setRowsPerPage,
    setPage,
    catalogues,
    statuses,
}) => {
    const { colors } = useTheme()

    const onClose = () => modalRef.current?.close()

    const sortOptions = [
        { label: 'Nombre', value: 'nombre' },
        { label: 'Lote', value: 'lote' },
        { label: 'Código', value: 'codigo' },
        { label: 'Fecha', value: 'fecha' },
    ]

    const rowsOptions = [
        { label: '5 filas', value: '5' },
        { label: '10 filas', value: '10' },
        { label: '20 filas', value: '20' },
        { label: '50 filas', value: '50' },
    ]

    const handleSortChange = (val) => {
        const selectedLabel = sortOptions.find((opt) => opt.value === val)?.label
        setSortOption({ value: val, label: selectedLabel })
    }

    // Componente auxiliar SIN ICONO
    const RenderRadioItem = ({ value, label }) => (
        <RadioGroup.Item value={value} className="-my-0.5 flex-row items-center p-4 bg-accent-soft rounded-lg border-0">
            <View className="flex-1">
                <RadioGroup.Title className="text-foreground font-medium text-lg">{label}</RadioGroup.Title>
            </View>
            <RadioGroup.Indicator />
        </RadioGroup.Item>
    )

    return (
        <Modalize ref={modalRef} {...MODAL_ANIMATION_PROPS} modalStyle={{ backgroundColor: colors.background }}>
            <View style={{ maxHeight: MODAL_MAX_HEIGHT }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: '6%', paddingTop: '9%', paddingBottom: '6%' }}>
                    <View className="flex gap-0 mb-8">
                        <View className="flex flex-row justify-between items-center">
                            <Text className="text-foreground text-2xl font-medium">Opciones</Text>
                            <Button isIconOnly className="bg-transparent shrink-0" onPress={onClose}>
                                <Ionicons name="close-outline" size={24} color={colors.foreground} />
                            </Button>
                        </View>
                        <Text className="text-muted-foreground">Ordena y filtra tus resultados</Text>
                    </View>

                    <View className="gap-6">
                        {/* ORDENAR POR */}
                        <View>
                            <View className="mb-0">
                                <Text className="text-[12px] font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Ordenar por</Text>
                            </View>
                            <RadioGroup value={sortOption.value} onValueChange={handleSortChange}>
                                {sortOptions.map((opt) => (
                                    <RenderRadioItem key={opt.value} value={opt.value} label={opt.label} />
                                ))}
                            </RadioGroup>
                        </View>

                        {/* FILTRAR POR CATÁLOGO */}
                        <View>
                            <View className="mb-0">
                                <Text className="text-[12px] font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Filtrar por catálogo</Text>
                            </View>
                            <RadioGroup value={catalogueFilter} onValueChange={(val) => setCatalogueFilter(val)}>
                                <RenderRadioItem value="all" label="Todos los catálogos" />
                                {catalogues.map((cat) => (
                                    <RenderRadioItem key={cat.id} value={String(cat.id)} label={cat.name} />
                                ))}
                            </RadioGroup>
                        </View>

                        {/* FILTRAR POR ESTADO */}
                        <View>
                            <View className="mb-0">
                                <Text className="text-[12px] font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Filtrar por estado</Text>
                            </View>
                            <RadioGroup value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
                                <RenderRadioItem value="all" label="Todos los estados" />
                                {statuses.map((status) => (
                                    <RenderRadioItem key={status.id} value={String(status.id)} label={status.name} />
                                ))}
                            </RadioGroup>
                        </View>

                        {/* FILAS POR PÁGINA */}
                        <View>
                            <View className="mb-0">
                                <Text className="text-[12px] font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Filas por página</Text>
                            </View>
                            <RadioGroup
                                value={rowsPerPage}
                                onValueChange={(val) => {
                                    setRowsPerPage(val)
                                    setPage(1)
                                }}
                            >
                                {rowsOptions.map((opt) => (
                                    <RenderRadioItem key={opt.value} value={opt.value} label={opt.label} />
                                ))}
                            </RadioGroup>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modalize>
    )
}

// =====================================================================
// MODAL VER CÓDIGO QR
// =====================================================================
const ViewQrModalContent = ({ modalRef, product, alertRef }) => {
    const { colors } = useTheme()
    const [qrImage, setQrImage] = useState(null)
    const [isLoadingQr, setIsLoadingQr] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)

    // Hook de permisos
    const [permissionResponse, requestPermission] = MediaLibrary.usePermissions()

    useEffect(() => {
        if (product?.qrHash) {
            loadQrImage()
        }
    }, [product])

    const loadQrImage = async () => {
        try {
            setIsLoadingQr(true)
            const imageBlob = await getQrCodeImage(product.qrHash)
            const reader = new FileReader()
            reader.onloadend = () => {
                setQrImage(reader.result)
            }
            reader.readAsDataURL(imageBlob)
        } catch (error) {
            console.error('Error loading QR:', error)
            alertRef.current?.show('Error', 'No se pudo cargar el código QR', 'error')
        } finally {
            setIsLoadingQr(false)
        }
    }

    const handleDownloadQr = async () => {
        if (!qrImage || !product) return

        try {
            setIsDownloading(true)

            // 1. Ruta del archivo
            const fileName = `QR_${product.nombre.replace(/\s+/g, '_')}_${product.lote}.png`
            const fileUri = `${FileSystem.cacheDirectory}${fileName}`

            const base64Code = qrImage.split(',')[1]

            // 2. Escribir archivo (Usando la API legacy importada arriba)
            await FileSystem.writeAsStringAsync(
                fileUri,
                base64Code,
                { encoding: 'base64' }, // Mantenemos el string 'base64' por seguridad
            )

            // 3. Verificar Permisos
            let hasPermission = false
            if (permissionResponse?.status === 'granted') {
                hasPermission = true
            } else if (permissionResponse?.canAskAgain) {
                const { status } = await requestPermission()
                hasPermission = status === 'granted'
            }

            // 4. Guardar o Compartir
            if (hasPermission) {
                const asset = await MediaLibrary.createAssetAsync(fileUri)
                try {
                    await MediaLibrary.createAlbumAsync('QR Codes', asset, false)
                } catch (e) {
                    console.log('Imagen guardada, álbum omitido.')
                }
                alertRef.current?.show('Éxito', 'Código QR guardado en galería', 'success')
            } else {
                const canShare = await Sharing.isAvailableAsync()
                if (canShare) {
                    await Sharing.shareAsync(fileUri, {
                        mimeType: 'image/png',
                        dialogTitle: 'Guardar código QR',
                        UTI: 'public.png',
                    })
                    alertRef.current?.show('Aviso', 'Imagen compartida', 'success')
                } else {
                    alertRef.current?.show('Error', 'No se pudo guardar ni compartir', 'error')
                }
            }
        } catch (error) {
            console.error('Error downloading QR:', error)
            const msg = error.message?.includes('AUDIO') ? 'Error de configuración de permisos' : 'No se pudo descargar el código QR'
            alertRef.current?.show('Error', msg, 'error')
        } finally {
            setIsDownloading(false)
        }
    }

    const onClose = () => modalRef.current?.close()

    return (
        <Modalize ref={modalRef} {...MODAL_ANIMATION_PROPS} modalStyle={{ backgroundColor: colors.background }}>
            <View style={{ maxHeight: MODAL_MAX_HEIGHT }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingHorizontal: '6%', paddingTop: '9%', paddingBottom: '6%' }}
                >
                    {product ? (
                        <>
                            <View className="flex gap-0 mb-8">
                                <View className="flex flex-row justify-between items-center">
                                    <Text className="text-foreground text-2xl font-medium">Código QR</Text>
                                    <Button isIconOnly className="bg-transparent shrink-0" onPress={onClose}>
                                        <Ionicons name="close-outline" size={24} color={colors.foreground} />
                                    </Button>
                                </View>
                                <Text className="text-muted-foreground">Código QR del producto</Text>
                            </View>
                            <View className="items-center gap-6">
                                <View className="bg-white p-1 rounded-lg">
                                    {isLoadingQr ? (
                                        <View className="w-64 h-64 items-center justify-center">
                                            <Spinner color={colors.accent} size="lg" />
                                        </View>
                                    ) : qrImage ? (
                                        <Image source={{ uri: qrImage }} style={{ width: 256, height: 256 }} resizeMode="contain" />
                                    ) : (
                                        <View className="w-64 h-64 items-center justify-center bg-surface-1 rounded-lg">
                                            <Ionicons name="qr-code-outline" size={64} color={colors.muted} />
                                            <Text className="text-muted-foreground mt-4">No disponible</Text>
                                        </View>
                                    )}
                                </View>
                                <View className="w-full gap-2">
                                    <InfoRow label="Producto" value={product.nombre} />
                                    <InfoRow label="Lote" value={product.lote} />
                                    <InfoRow label="Código" value={product.codigo} />
                                </View>
                                <Button className="w-full bg-accent mt-4" onPress={handleDownloadQr} isDisabled={isLoadingQr || !qrImage || isDownloading}>
                                    {isDownloading ? (
                                        <>
                                            <Spinner color={colors.accentForeground} size="sm" />
                                            <Button.Label>Descargando...</Button.Label>
                                        </>
                                    ) : (
                                        <>
                                            <Ionicons name="download-outline" size={24} color={colors.accentForeground} />
                                            <Button.Label>Descargar código QR</Button.Label>
                                        </>
                                    )}
                                </Button>
                            </View>
                        </>
                    ) : (
                        <View className="h-20" />
                    )}
                </ScrollView>
            </View>
        </Modalize>
    )
}

// Continuará en el siguiente mensaje con CreateProductModal...
// =====================================================================
// MODAL DE CREACIÓN DE PRODUCTO
// =====================================================================
const CreateProductModalContent = ({ modalRef, onProductCreated, isLoading, alertRef, catalogues, statuses }) => {
    const { colors } = useTheme()
    const catalogueModalRef = useRef(null)
    const statusModalRef = useRef(null)

    const [isSaving, setIsSaving] = useState(false)
    const [newProduct, setNewProduct] = useState({
        stockCatalogueId: '',
        productStatusId: '',
        lote: '',
        fechaIngreso: '',
        fechaCaducidad: '',
        reanalisis: '',
        cantidadTexto: '',
        totalEnvases: '',
    })

    const [productErrors, setProductErrors] = useState({
        stockCatalogueId: [],
        productStatusId: [],
        lote: [],
        fechaIngreso: [],
        fechaCaducidad: [],
        reanalisis: [],
        cantidadTexto: [],
        totalEnvases: [],
    })

    // Validadores
    const validators = {
        stockCatalogueId: [required],
        productStatusId: [required],
        lote: [required],
        fechaIngreso: [required],
        fechaCaducidad: [required],
        reanalisis: [],
        cantidadTexto: [required, validPositiveNumber],
        totalEnvases: [required, validPositiveNumber],
    }

    const runValidators = (value, fns) => fns.map((fn) => fn(value)).filter(Boolean)

    const handleInputChange = (field, value) => {
        setNewProduct((prev) => ({ ...prev, [field]: value }))
        const fns = validators[field] || []
        const errs = runValidators(value, fns)
        setProductErrors((prev) => ({ ...prev, [field]: errs }))
    }

    const onClose = () => {
        modalRef.current?.close()
        setNewProduct({
            stockCatalogueId: '',
            productStatusId: '',
            lote: '',
            fechaIngreso: '',
            fechaCaducidad: '',
            reanalisis: '',
            cantidadTexto: '',
            totalEnvases: '',
        })
        setProductErrors({
            stockCatalogueId: [],
            productStatusId: [],
            lote: [],
            fechaIngreso: [],
            fechaCaducidad: [],
            reanalisis: [],
            cantidadTexto: [],
            totalEnvases: [],
        })
    }

    const getCatalogueName = (id) => {
        const cat = catalogues.find((c) => c.id === Number(id))
        return cat ? cat.name : 'Seleccionar catálogo'
    }

    const getStatusName = (id) => {
        const status = statuses.find((s) => s.id === Number(id))
        return status ? status.name : 'Seleccionar estado'
    }

    const handleCreate = async () => {
        // Validación final
        const stockCatalogueIdErrs = runValidators(newProduct.stockCatalogueId, validators.stockCatalogueId)
        const productStatusIdErrs = runValidators(newProduct.productStatusId, validators.productStatusId)
        const loteErrs = runValidators(newProduct.lote, validators.lote)
        const fechaIngresoErrs = runValidators(newProduct.fechaIngreso, validators.fechaIngreso)
        const fechaCaducidadErrs = runValidators(newProduct.fechaCaducidad, validators.fechaCaducidad)
        const reanalisisErrs = runValidators(newProduct.reanalisis, validators.reanalisis)
        const cantidadTextoErrs = runValidators(newProduct.cantidadTexto, validators.cantidadTexto)
        const totalEnvasesErrs = runValidators(newProduct.totalEnvases, validators.totalEnvases)

        if (
            stockCatalogueIdErrs.length > 0 ||
            productStatusIdErrs.length > 0 ||
            loteErrs.length > 0 ||
            fechaIngresoErrs.length > 0 ||
            fechaCaducidadErrs.length > 0 ||
            reanalisisErrs.length > 0 ||
            cantidadTextoErrs.length > 0 ||
            totalEnvasesErrs.length > 0
        ) {
            setProductErrors({
                stockCatalogueId: stockCatalogueIdErrs,
                productStatusId: productStatusIdErrs,
                lote: loteErrs,
                fechaIngreso: fechaIngresoErrs,
                fechaCaducidad: fechaCaducidadErrs,
                reanalisis: reanalisisErrs,
                cantidadTexto: cantidadTextoErrs,
                totalEnvases: totalEnvasesErrs,
            })
            alertRef.current?.show('Atención', 'Por favor corrija los errores en el formulario.', 'warning')
            return
        }

        try {
            setIsSaving(true)

            const productData = {
                stockCatalogueId: Number(newProduct.stockCatalogueId),
                productStatusId: Number(newProduct.productStatusId),
                lote: newProduct.lote.trim(),
                fechaIngreso: newProduct.fechaIngreso,
                fechaCaducidad: newProduct.fechaCaducidad,
                reanalisis: newProduct.reanalisis || null,
                cantidadTexto: Number(newProduct.cantidadTexto),
                totalEnvases: Number(newProduct.totalEnvases),
            }

            await createProduct(productData)
            onClose()
            setTimeout(() => {
                alertRef.current?.show('Éxito', 'Producto creado correctamente', 'success')
            }, 300)
            if (onProductCreated) onProductCreated()
        } catch (error) {
            console.error('Error create product:', error)
            if (error.response?.data) {
                const { result, title } = error.response.data
                alertRef.current?.show('Error', title || 'Error al crear producto', 'error')

                if (result && Array.isArray(result) && result.length > 0) {
                    const newFieldErrors = {
                        stockCatalogueId: [],
                        productStatusId: [],
                        lote: [],
                        fechaIngreso: [],
                        fechaCaducidad: [],
                        reanalisis: [],
                        cantidadTexto: [],
                        totalEnvases: [],
                    }
                    result.forEach((validationError) => {
                        const field = validationError.field
                        const descriptions = validationError.descriptions || []
                        if (newFieldErrors.hasOwnProperty(field)) {
                            newFieldErrors[field] = descriptions
                        }
                    })
                    setProductErrors(newFieldErrors)
                }
            } else {
                alertRef.current?.show('Error', 'No se pudo crear el producto', 'error')
            }
        } finally {
            setIsSaving(false)
        }
    }

    const hasErrors = () => {
        return (
            productErrors.stockCatalogueId.length > 0 ||
            productErrors.productStatusId.length > 0 ||
            productErrors.lote.length > 0 ||
            productErrors.fechaIngreso.length > 0 ||
            productErrors.fechaCaducidad.length > 0 ||
            productErrors.reanalisis.length > 0 ||
            productErrors.cantidadTexto.length > 0 ||
            productErrors.totalEnvases.length > 0 ||
            !newProduct.stockCatalogueId ||
            !newProduct.productStatusId ||
            !newProduct.lote.trim() ||
            !newProduct.fechaIngreso ||
            !newProduct.fechaCaducidad ||
            !newProduct.cantidadTexto ||
            !newProduct.totalEnvases
        )
    }

    return (
        <>
            <Modalize ref={modalRef} {...MODAL_ANIMATION_PROPS} modalStyle={{ backgroundColor: colors.background }}>
                <View style={{ maxHeight: MODAL_MAX_HEIGHT }}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingHorizontal: '6%', paddingTop: '9%', paddingBottom: '6%' }}
                    >
                        <View className="flex gap-0 mb-8">
                            <View className="flex flex-row justify-between items-center">
                                <Text className="text-foreground text-2xl font-medium">Registrar producto</Text>
                                <Button isIconOnly className="bg-transparent shrink-0" onPress={onClose}>
                                    <Ionicons name="close-outline" size={24} color={colors.foreground} />
                                </Button>
                            </View>
                            <Text className="text-muted-foreground">Ingrese los datos del nuevo producto</Text>
                        </View>

                        <View className="gap-6">
                            {/* CATÁLOGO */}
                            <View>
                                <Text className="text-foreground font-medium mb-2">
                                    Catálogo <Text className="text-danger">*</Text>
                                </Text>
                                <TouchableOpacity onPress={() => catalogueModalRef.current?.open()}>
                                    <View className="w-full h-12 flex-row items-center justify-between px-4 rounded-lg bg-accent-soft">
                                        <Text className="text-foreground font-medium">{getCatalogueName(newProduct.stockCatalogueId)}</Text>
                                        <Ionicons name="chevron-down-outline" size={24} color={colors.accent} />
                                    </View>
                                </TouchableOpacity>
                                {productErrors.stockCatalogueId.length > 0 ? (
                                    <Text className="text-danger text-sm mt-1">{productErrors.stockCatalogueId.join('\n')}</Text>
                                ) : null}
                            </View>

                            {/* ESTADO */}
                            <View>
                                <Text className="text-foreground font-medium mb-2">
                                    Estado <Text className="text-danger">*</Text>
                                </Text>
                                <TouchableOpacity onPress={() => statusModalRef.current?.open()}>
                                    <View className="w-full h-12 flex-row items-center justify-between px-4 rounded-lg bg-accent-soft">
                                        <Text className="text-foreground font-medium">{getStatusName(newProduct.productStatusId)}</Text>
                                        <Ionicons name="chevron-down-outline" size={24} color={colors.accent} />
                                    </View>
                                </TouchableOpacity>
                                {productErrors.productStatusId.length > 0 ? (
                                    <Text className="text-danger text-sm mt-1">{productErrors.productStatusId.join('\n')}</Text>
                                ) : null}
                            </View>

                            {/* LOTE */}
                            <TextField isRequired isInvalid={productErrors.lote.length > 0}>
                                <View className="flex-row justify-between items-center mb-2">
                                    <TextField.Label className="text-foreground font-medium">Lote</TextField.Label>
                                    <Text className="text-muted-foreground text-xs">{newProduct.lote.length} / 100</Text>
                                </View>
                                <TextField.Input
                                    colors={{
                                        blurBackground: colors.accentSoft,
                                        focusBackground: colors.surface2,
                                        blurBorder: productErrors.lote.length > 0 ? colors.danger : colors.accentSoft,
                                        focusBorder: productErrors.lote.length > 0 ? colors.danger : colors.surface2,
                                    }}
                                    placeholder="Número de lote"
                                    value={newProduct.lote}
                                    onChangeText={(text) => handleInputChange('lote', text)}
                                    cursorColor={colors.accent}
                                    selectionHandleColor={colors.accent}
                                    selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                    maxLength={100}
                                >
                                    <TextField.InputEndContent>
                                        {productErrors.lote.length === 0 && newProduct.lote.trim() ? (
                                            <Ionicons name="checkmark" size={24} color={colors.accent} />
                                        ) : productErrors.lote.length > 0 ? (
                                            <Ionicons name="close" size={24} color={colors.danger} />
                                        ) : null}
                                    </TextField.InputEndContent>
                                </TextField.Input>
                                {productErrors.lote.length > 0 ? <TextField.ErrorMessage>{productErrors.lote.join('\n')}</TextField.ErrorMessage> : undefined}
                            </TextField>

                            {/* FECHA INGRESO */}
                            <TextField isRequired isInvalid={productErrors.fechaIngreso.length > 0}>
                                <TextField.Label className="text-foreground font-medium mb-2">Fecha de ingreso</TextField.Label>
                                <TextField.Input
                                    colors={{
                                        blurBackground: colors.accentSoft,
                                        focusBackground: colors.surface2,
                                        blurBorder: productErrors.fechaIngreso.length > 0 ? colors.danger : colors.accentSoft,
                                        focusBorder: productErrors.fechaIngreso.length > 0 ? colors.danger : colors.surface2,
                                    }}
                                    placeholder="YYYY-MM-DD"
                                    value={newProduct.fechaIngreso}
                                    onChangeText={(text) => handleInputChange('fechaIngreso', text)}
                                    cursorColor={colors.accent}
                                    selectionHandleColor={colors.accent}
                                    selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                >
                                    <TextField.InputEndContent>
                                        {productErrors.fechaIngreso.length === 0 && newProduct.fechaIngreso ? (
                                            <Ionicons name="checkmark" size={24} color={colors.accent} />
                                        ) : productErrors.fechaIngreso.length > 0 ? (
                                            <Ionicons name="close" size={24} color={colors.danger} />
                                        ) : null}
                                    </TextField.InputEndContent>
                                </TextField.Input>
                                {productErrors.fechaIngreso.length > 0 ? (
                                    <TextField.ErrorMessage>{productErrors.fechaIngreso.join('\n')}</TextField.ErrorMessage>
                                ) : undefined}
                            </TextField>

                            {/* FECHA CADUCIDAD */}
                            <TextField isRequired isInvalid={productErrors.fechaCaducidad.length > 0}>
                                <TextField.Label className="text-foreground font-medium mb-2">Fecha de caducidad</TextField.Label>
                                <TextField.Input
                                    colors={{
                                        blurBackground: colors.accentSoft,
                                        focusBackground: colors.surface2,
                                        blurBorder: productErrors.fechaCaducidad.length > 0 ? colors.danger : colors.accentSoft,
                                        focusBorder: productErrors.fechaCaducidad.length > 0 ? colors.danger : colors.surface2,
                                    }}
                                    placeholder="YYYY-MM-DD"
                                    value={newProduct.fechaCaducidad}
                                    onChangeText={(text) => handleInputChange('fechaCaducidad', text)}
                                    cursorColor={colors.accent}
                                    selectionHandleColor={colors.accent}
                                    selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                >
                                    <TextField.InputEndContent>
                                        {productErrors.fechaCaducidad.length === 0 && newProduct.fechaCaducidad ? (
                                            <Ionicons name="checkmark" size={24} color={colors.accent} />
                                        ) : productErrors.fechaCaducidad.length > 0 ? (
                                            <Ionicons name="close" size={24} color={colors.danger} />
                                        ) : null}
                                    </TextField.InputEndContent>
                                </TextField.Input>
                                {productErrors.fechaCaducidad.length > 0 ? (
                                    <TextField.ErrorMessage>{productErrors.fechaCaducidad.join('\n')}</TextField.ErrorMessage>
                                ) : undefined}
                            </TextField>

                            {/* REANÁLISIS */}
                            <TextField isInvalid={productErrors.reanalisis.length > 0}>
                                <TextField.Label className="text-foreground font-medium mb-2">Reanálisis (Opcional)</TextField.Label>
                                <TextField.Input
                                    colors={{
                                        blurBackground: colors.accentSoft,
                                        focusBackground: colors.surface2,
                                        blurBorder: productErrors.reanalisis.length > 0 ? colors.danger : colors.accentSoft,
                                        focusBorder: productErrors.reanalisis.length > 0 ? colors.danger : colors.surface2,
                                    }}
                                    placeholder="YYYY-MM-DD"
                                    value={newProduct.reanalisis}
                                    onChangeText={(text) => handleInputChange('reanalisis', text)}
                                    cursorColor={colors.accent}
                                    selectionHandleColor={colors.accent}
                                    selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                >
                                    <TextField.InputEndContent>
                                        {productErrors.reanalisis.length === 0 && newProduct.reanalisis ? (
                                            <Ionicons name="checkmark" size={24} color={colors.accent} />
                                        ) : productErrors.reanalisis.length > 0 ? (
                                            <Ionicons name="close" size={24} color={colors.danger} />
                                        ) : null}
                                    </TextField.InputEndContent>
                                </TextField.Input>
                                {productErrors.reanalisis.length > 0 ? (
                                    <TextField.ErrorMessage>{productErrors.reanalisis.join('\n')}</TextField.ErrorMessage>
                                ) : undefined}
                            </TextField>

                            {/* CANTIDAD TEXTO */}
                            <TextField isRequired isInvalid={productErrors.cantidadTexto.length > 0}>
                                <TextField.Label className="text-foreground font-medium mb-2">Cantidad (ml/g por envase)</TextField.Label>
                                <TextField.Input
                                    colors={{
                                        blurBackground: colors.accentSoft,
                                        focusBackground: colors.surface2,
                                        blurBorder: productErrors.cantidadTexto.length > 0 ? colors.danger : colors.accentSoft,
                                        focusBorder: productErrors.cantidadTexto.length > 0 ? colors.danger : colors.surface2,
                                    }}
                                    placeholder="Ej: 500"
                                    value={newProduct.cantidadTexto}
                                    onChangeText={(text) => handleInputChange('cantidadTexto', text)}
                                    keyboardType="numeric"
                                    cursorColor={colors.accent}
                                    selectionHandleColor={colors.accent}
                                    selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                >
                                    <TextField.InputEndContent>
                                        {productErrors.cantidadTexto.length === 0 && newProduct.cantidadTexto ? (
                                            <Ionicons name="checkmark" size={24} color={colors.accent} />
                                        ) : productErrors.cantidadTexto.length > 0 ? (
                                            <Ionicons name="close" size={24} color={colors.danger} />
                                        ) : null}
                                    </TextField.InputEndContent>
                                </TextField.Input>
                                {productErrors.cantidadTexto.length > 0 ? (
                                    <TextField.ErrorMessage>{productErrors.cantidadTexto.join('\n')}</TextField.ErrorMessage>
                                ) : undefined}
                            </TextField>

                            {/* TOTAL ENVASES */}
                            <TextField isRequired isInvalid={productErrors.totalEnvases.length > 0}>
                                <TextField.Label className="text-foreground font-medium mb-2">Total de envases</TextField.Label>
                                <TextField.Input
                                    colors={{
                                        blurBackground: colors.accentSoft,
                                        focusBackground: colors.surface2,
                                        blurBorder: productErrors.totalEnvases.length > 0 ? colors.danger : colors.accentSoft,
                                        focusBorder: productErrors.totalEnvases.length > 0 ? colors.danger : colors.surface2,
                                    }}
                                    placeholder="Ej: 10"
                                    value={newProduct.totalEnvases}
                                    onChangeText={(text) => handleInputChange('totalEnvases', text)}
                                    keyboardType="numeric"
                                    cursorColor={colors.accent}
                                    selectionHandleColor={colors.accent}
                                    selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                >
                                    <TextField.InputEndContent>
                                        {productErrors.totalEnvases.length === 0 && newProduct.totalEnvases ? (
                                            <Ionicons name="checkmark" size={24} color={colors.accent} />
                                        ) : productErrors.totalEnvases.length > 0 ? (
                                            <Ionicons name="close" size={24} color={colors.danger} />
                                        ) : null}
                                    </TextField.InputEndContent>
                                </TextField.Input>
                                {productErrors.totalEnvases.length > 0 ? (
                                    <TextField.ErrorMessage>{productErrors.totalEnvases.join('\n')}</TextField.ErrorMessage>
                                ) : undefined}
                            </TextField>
                        </View>

                        <View className="flex-row justify-end gap-3 pt-8">
                            <Button className="flex-1" variant="primary" onPress={handleCreate} isDisabled={isLoading || isSaving || hasErrors()}>
                                {isSaving ? (
                                    <>
                                        <Spinner color={colors.accentForeground} size="md" />
                                        <Button.Label>Registrando...</Button.Label>
                                    </>
                                ) : (
                                    <>
                                        <Ionicons name="add-outline" size={24} color={colors.accentForeground} />
                                        <Button.Label>Registrar</Button.Label>
                                    </>
                                )}
                            </Button>
                        </View>
                    </ScrollView>
                </View>
            </Modalize>
            <Modalize ref={catalogueModalRef} {...MODAL_ANIMATION_PROPS} modalStyle={{ backgroundColor: colors.background }}>
                <View className="px-[6%] pt-[9%] pb-[6%]" style={{ maxHeight: MODAL_MAX_HEIGHT }}>
                    <View className="flex gap-0 mb-8">
                        <View className="flex flex-row justify-between items-center">
                            <Text className="text-foreground text-2xl font-medium">Seleccionar catálogo</Text>
                            <Button isIconOnly className="bg-transparent shrink-0" onPress={() => catalogueModalRef.current?.close()}>
                                <Ionicons name="close-outline" size={24} color={colors.foreground} />
                            </Button>
                        </View>
                        <Text className="text-muted-foreground">Seleccione el catálogo del producto</Text>
                    </View>
                    <ScrollView style={{ maxHeight: height * 0.5 }} showsVerticalScrollIndicator={false}>
                        <View>
                            <View className="mb-0">
                                <Text className="text-[12px] font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Catálogos disponibles</Text>
                            </View>
                            <RadioGroup value={String(newProduct.stockCatalogueId)} onValueChange={(val) => handleInputChange('stockCatalogueId', val)}>
                                {catalogues.map((cat) => (
                                    <RadioGroup.Item
                                        key={cat.id}
                                        value={String(cat.id)}
                                        className="-my-0.5 flex-row items-center p-4 bg-accent-soft rounded-lg border-0"
                                    >
                                        <View className="flex-1">
                                            <RadioGroup.Title className="text-foreground font-medium text-lg">{cat.name}</RadioGroup.Title>
                                        </View>
                                        <RadioGroup.Indicator />
                                    </RadioGroup.Item>
                                ))}
                            </RadioGroup>
                        </View>
                    </ScrollView>
                </View>
            </Modalize>

            {/* Modal de selección de estado */}
            <Modalize ref={statusModalRef} {...MODAL_ANIMATION_PROPS} modalStyle={{ backgroundColor: colors.background }}>
                <View className="px-[6%] pt-[9%] pb-[6%]" style={{ maxHeight: MODAL_MAX_HEIGHT }}>
                    <View className="flex gap-0 mb-8">
                        <View className="flex flex-row justify-between items-center">
                            <Text className="text-foreground text-2xl font-medium">Seleccionar estado</Text>
                            <Button isIconOnly className="bg-transparent shrink-0" onPress={() => statusModalRef.current?.close()}>
                                <Ionicons name="close-outline" size={24} color={colors.foreground} />
                            </Button>
                        </View>
                        <Text className="text-muted-foreground">Seleccione el estado del producto</Text>
                    </View>
                    <ScrollView style={{ maxHeight: height * 0.5 }} showsVerticalScrollIndicator={false}>
                        <View>
                            <View className="mb-0">
                                <Text className="text-[12px] font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Estados disponibles</Text>
                            </View>
                            <RadioGroup value={String(newProduct.productStatusId)} onValueChange={(val) => handleInputChange('productStatusId', val)}>
                                {statuses.map((status) => (
                                    <RadioGroup.Item
                                        key={status.id}
                                        value={String(status.id)}
                                        className="-my-0.5 flex-row items-center p-4 bg-accent-soft rounded-lg border-0"
                                    >
                                        <View className="flex-1">
                                            <RadioGroup.Title className="text-foreground font-medium text-lg">{status.name}</RadioGroup.Title>
                                        </View>
                                        <RadioGroup.Indicator />
                                    </RadioGroup.Item>
                                ))}
                            </RadioGroup>
                        </View>
                    </ScrollView>
                </View>
            </Modalize>
        </>
    )
}

// =====================================================================
// MODAL DE EDICIÓN DE PRODUCTO (ESQUELETO)
// =====================================================================
const EditProductModalContent = ({ modalRef, product, onProductUpdated, alertRef, catalogues, statuses }) => {
    const { colors } = useTheme()
    const catalogueModalRef = useRef(null)
    const statusModalRef = useRef(null)
    const [isSaving, setIsSaving] = useState(false)
    const [editedProduct, setEditedProduct] = useState({
        id: null,
        stockCatalogueId: '',
        productStatusId: '',
        lote: '',
        fechaIngreso: '',
        fechaCaducidad: '',
        reanalisis: '',
    })
    const [productErrors, setProductErrors] = useState({
        stockCatalogueId: [],
        productStatusId: [],
        lote: [],
        fechaIngreso: [],
        fechaCaducidad: [],
        reanalisis: [],
    })

    const validators = {
        stockCatalogueId: [required],
        productStatusId: [required],
        lote: [required],
        fechaIngreso: [required],
        fechaCaducidad: [required],
        reanalisis: [],
    }

    const runValidators = (value, fns) => fns.map((fn) => fn(value)).filter(Boolean)

    const handleInputChange = (field, value) => {
        setEditedProduct((prev) => ({ ...prev, [field]: value }))
        const fns = validators[field] || []
        const errs = runValidators(value, fns)
        setProductErrors((prev) => ({ ...prev, [field]: errs }))
    }

    useEffect(() => {
        if (product) {
            setEditedProduct({
                id: product.id,
                stockCatalogueId: product.stockCatalogueId || '',
                productStatusId: product.productStatusId || '',
                lote: product.lote || '',
                fechaIngreso: product.fecha ? product.fecha.split('T')[0] : '',
                fechaCaducidad: product.caducidad ? product.caducidad.split('T')[0] : '',
                reanalisis: product.reanalisis ? product.reanalisis.split('T')[0] : '',
            })
            setProductErrors({
                stockCatalogueId: [],
                productStatusId: [],
                lote: [],
                fechaIngreso: [],
                fechaCaducidad: [],
                reanalisis: [],
            })
        }
    }, [product])

    const onClose = () => modalRef.current?.close()

    const getCatalogueName = (id) => {
        const cat = catalogues.find((c) => c.id === Number(id))
        return cat ? cat.name : 'Seleccionar catálogo'
    }

    const getStatusName = (id) => {
        const status = statuses.find((s) => s.id === Number(id))
        return status ? status.name : 'Seleccionar estado'
    }

    const handleSave = async () => {
        // Validación final
        const stockCatalogueIdErrs = runValidators(editedProduct.stockCatalogueId, validators.stockCatalogueId)
        const productStatusIdErrs = runValidators(editedProduct.productStatusId, validators.productStatusId)
        const loteErrs = runValidators(editedProduct.lote, validators.lote)
        const fechaIngresoErrs = runValidators(editedProduct.fechaIngreso, validators.fechaIngreso)
        const fechaCaducidadErrs = runValidators(editedProduct.fechaCaducidad, validators.fechaCaducidad)
        const reanalisisErrs = runValidators(editedProduct.reanalisis, validators.reanalisis)

        if (
            stockCatalogueIdErrs.length > 0 ||
            productStatusIdErrs.length > 0 ||
            loteErrs.length > 0 ||
            fechaIngresoErrs.length > 0 ||
            fechaCaducidadErrs.length > 0 ||
            reanalisisErrs.length > 0
        ) {
            setProductErrors({
                stockCatalogueId: stockCatalogueIdErrs,
                productStatusId: productStatusIdErrs,
                lote: loteErrs,
                fechaIngreso: fechaIngresoErrs,
                fechaCaducidad: fechaCaducidadErrs,
                reanalisis: reanalisisErrs,
            })
            alertRef.current?.show('Atención', 'Por favor corrija los errores en el formulario.', 'warning')
            return
        }

        try {
            setIsSaving(true)
            // TODO: Implementar actualización cuando exista el servicio
            // await updateProduct(editedProduct)
            alertRef.current?.show('Info', 'Funcionalidad de edición en desarrollo', 'warning')
            onClose()
        } catch (error) {
            console.error('Error update product:', error)
            alertRef.current?.show('Error', 'No se pudo actualizar el producto', 'error')
        } finally {
            setIsSaving(false)
        }
    }

    const hasErrors = () => {
        return (
            productErrors.stockCatalogueId.length > 0 ||
            productErrors.productStatusId.length > 0 ||
            productErrors.lote.length > 0 ||
            productErrors.fechaIngreso.length > 0 ||
            productErrors.fechaCaducidad.length > 0 ||
            productErrors.reanalisis.length > 0 ||
            !editedProduct.stockCatalogueId ||
            !editedProduct.productStatusId ||
            !editedProduct.lote.trim() ||
            !editedProduct.fechaIngreso ||
            !editedProduct.fechaCaducidad
        )
    }

    return (
        <>
            <Modalize ref={modalRef} {...MODAL_ANIMATION_PROPS} modalStyle={{ backgroundColor: colors.background }}>
                <View style={{ maxHeight: MODAL_MAX_HEIGHT }}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingHorizontal: '6%', paddingTop: '9%', paddingBottom: '6%' }}
                    >
                        {product ? (
                            <>
                                <View className="flex gap-0 mb-8">
                                    <View className="flex flex-row justify-between items-center">
                                        <Text className="text-foreground text-2xl font-medium">Editar producto</Text>
                                        <Button isIconOnly className="bg-transparent shrink-0" onPress={onClose}>
                                            <Ionicons name="close-outline" size={24} color={colors.foreground} />
                                        </Button>
                                    </View>
                                    <Text className="text-muted-foreground">Edite los datos del producto</Text>
                                </View>

                                <View className="gap-6">
                                    {/* CATÁLOGO */}
                                    <View>
                                        <Text className="text-foreground font-medium mb-2">
                                            Catálogo <Text className="text-danger">*</Text>
                                        </Text>
                                        <TouchableOpacity onPress={() => catalogueModalRef.current?.open()}>
                                            <View className="w-full h-12 flex-row items-center justify-between px-4 rounded-lg bg-accent-soft">
                                                <Text className="text-foreground font-medium">{getCatalogueName(editedProduct.stockCatalogueId)}</Text>
                                                <Ionicons name="chevron-down-outline" size={24} color={colors.accent} />
                                            </View>
                                        </TouchableOpacity>
                                        {productErrors.stockCatalogueId.length > 0 ? (
                                            <Text className="text-danger text-sm mt-1">{productErrors.stockCatalogueId.join('\n')}</Text>
                                        ) : null}
                                    </View>

                                    {/* ESTADO */}
                                    <View>
                                        <Text className="text-foreground font-medium mb-2">
                                            Estado <Text className="text-danger">*</Text>
                                        </Text>
                                        <TouchableOpacity onPress={() => statusModalRef.current?.open()}>
                                            <View className="w-full h-12 flex-row items-center justify-between px-4 rounded-lg bg-accent-soft">
                                                <Text className="text-foreground font-medium">{getStatusName(editedProduct.productStatusId)}</Text>
                                                <Ionicons name="chevron-down-outline" size={24} color={colors.accent} />
                                            </View>
                                        </TouchableOpacity>
                                        {productErrors.productStatusId.length > 0 ? (
                                            <Text className="text-danger text-sm mt-1">{productErrors.productStatusId.join('\n')}</Text>
                                        ) : null}
                                    </View>

                                    {/* LOTE */}
                                    <TextField isRequired isInvalid={productErrors.lote.length > 0}>
                                        <View className="flex-row justify-between items-center mb-2">
                                            <TextField.Label className="text-foreground font-medium">Lote</TextField.Label>
                                            <Text className="text-muted-foreground text-xs">{editedProduct.lote.length} / 100</Text>
                                        </View>
                                        <TextField.Input
                                            colors={{
                                                blurBackground: colors.accentSoft,
                                                focusBackground: colors.surface2,
                                                blurBorder: productErrors.lote.length > 0 ? colors.danger : colors.accentSoft,
                                                focusBorder: productErrors.lote.length > 0 ? colors.danger : colors.surface2,
                                            }}
                                            placeholder="Número de lote"
                                            value={editedProduct.lote}
                                            onChangeText={(text) => handleInputChange('lote', text)}
                                            cursorColor={colors.accent}
                                            selectionHandleColor={colors.accent}
                                            selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                            maxLength={100}
                                        >
                                            <TextField.InputEndContent>
                                                {productErrors.lote.length === 0 && editedProduct.lote.trim() ? (
                                                    <Ionicons name="checkmark" size={24} color={colors.accent} />
                                                ) : productErrors.lote.length > 0 ? (
                                                    <Ionicons name="close" size={24} color={colors.danger} />
                                                ) : null}
                                            </TextField.InputEndContent>
                                        </TextField.Input>
                                        {productErrors.lote.length > 0 ? (
                                            <TextField.ErrorMessage>{productErrors.lote.join('\n')}</TextField.ErrorMessage>
                                        ) : undefined}
                                    </TextField>

                                    {/* FECHA INGRESO */}
                                    <TextField isRequired isInvalid={productErrors.fechaIngreso.length > 0}>
                                        <TextField.Label className="text-foreground font-medium mb-2">Fecha de ingreso</TextField.Label>
                                        <TextField.Input
                                            colors={{
                                                blurBackground: colors.accentSoft,
                                                focusBackground: colors.surface2,
                                                blurBorder: productErrors.fechaIngreso.length > 0 ? colors.danger : colors.accentSoft,
                                                focusBorder: productErrors.fechaIngreso.length > 0 ? colors.danger : colors.surface2,
                                            }}
                                            placeholder="YYYY-MM-DD"
                                            value={editedProduct.fechaIngreso}
                                            onChangeText={(text) => handleInputChange('fechaIngreso', text)}
                                            cursorColor={colors.accent}
                                            selectionHandleColor={colors.accent}
                                            selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                        >
                                            <TextField.InputEndContent>
                                                {productErrors.fechaIngreso.length === 0 && editedProduct.fechaIngreso ? (
                                                    <Ionicons name="checkmark" size={24} color={colors.accent} />
                                                ) : productErrors.fechaIngreso.length > 0 ? (
                                                    <Ionicons name="close" size={24} color={colors.danger} />
                                                ) : null}
                                            </TextField.InputEndContent>
                                        </TextField.Input>
                                        {productErrors.fechaIngreso.length > 0 ? (
                                            <TextField.ErrorMessage>{productErrors.fechaIngreso.join('\n')}</TextField.ErrorMessage>
                                        ) : undefined}
                                    </TextField>

                                    {/* FECHA CADUCIDAD */}
                                    <TextField isRequired isInvalid={productErrors.fechaCaducidad.length > 0}>
                                        <TextField.Label className="text-foreground font-medium mb-2">Fecha de caducidad</TextField.Label>
                                        <TextField.Input
                                            colors={{
                                                blurBackground: colors.accentSoft,
                                                focusBackground: colors.surface2,
                                                blurBorder: productErrors.fechaCaducidad.length > 0 ? colors.danger : colors.accentSoft,
                                                focusBorder: productErrors.fechaCaducidad.length > 0 ? colors.danger : colors.surface2,
                                            }}
                                            placeholder="YYYY-MM-DD"
                                            value={editedProduct.fechaCaducidad}
                                            onChangeText={(text) => handleInputChange('fechaCaducidad', text)}
                                            cursorColor={colors.accent}
                                            selectionHandleColor={colors.accent}
                                            selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                        >
                                            <TextField.InputEndContent>
                                                {productErrors.fechaCaducidad.length === 0 && editedProduct.fechaCaducidad ? (
                                                    <Ionicons name="checkmark" size={24} color={colors.accent} />
                                                ) : productErrors.fechaCaducidad.length > 0 ? (
                                                    <Ionicons name="close" size={24} color={colors.danger} />
                                                ) : null}
                                            </TextField.InputEndContent>
                                        </TextField.Input>
                                        {productErrors.fechaCaducidad.length > 0 ? (
                                            <TextField.ErrorMessage>{productErrors.fechaCaducidad.join('\n')}</TextField.ErrorMessage>
                                        ) : undefined}
                                    </TextField>

                                    {/* REANÁLISIS */}
                                    <TextField isInvalid={productErrors.reanalisis.length > 0}>
                                        <TextField.Label className="text-foreground font-medium mb-2">Reanálisis (Opcional)</TextField.Label>
                                        <TextField.Input
                                            colors={{
                                                blurBackground: colors.accentSoft,
                                                focusBackground: colors.surface2,
                                                blurBorder: productErrors.reanalisis.length > 0 ? colors.danger : colors.accentSoft,
                                                focusBorder: productErrors.reanalisis.length > 0 ? colors.danger : colors.surface2,
                                            }}
                                            placeholder="YYYY-MM-DD"
                                            value={editedProduct.reanalisis}
                                            onChangeText={(text) => handleInputChange('reanalisis', text)}
                                            cursorColor={colors.accent}
                                            selectionHandleColor={colors.accent}
                                            selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                        >
                                            <TextField.InputEndContent>
                                                {productErrors.reanalisis.length === 0 && editedProduct.reanalisis ? (
                                                    <Ionicons name="checkmark" size={24} color={colors.accent} />
                                                ) : productErrors.reanalisis.length > 0 ? (
                                                    <Ionicons name="close" size={24} color={colors.danger} />
                                                ) : null}
                                            </TextField.InputEndContent>
                                        </TextField.Input>
                                        {productErrors.reanalisis.length > 0 ? (
                                            <TextField.ErrorMessage>{productErrors.reanalisis.join('\n')}</TextField.ErrorMessage>
                                        ) : undefined}
                                    </TextField>
                                </View>

                                <View className="flex-row justify-end gap-3 pt-8">
                                    <Button className="flex-1" variant="primary" onPress={handleSave} isDisabled={isSaving || hasErrors()}>
                                        {isSaving ? (
                                            <>
                                                <Spinner color={colors.accentForeground} size="md" />
                                                <Button.Label>Guardando...</Button.Label>
                                            </>
                                        ) : (
                                            <>
                                                <Ionicons name="download-outline" size={24} color={colors.accentForeground} />
                                                <Button.Label>Guardar</Button.Label>
                                            </>
                                        )}
                                    </Button>
                                </View>
                            </>
                        ) : (
                            <View className="h-20" />
                        )}
                    </ScrollView>
                </View>
            </Modalize>

            {/* Modal de selección de catálogo */}
            {/* Modal de selección de catálogo */}
            <Modalize ref={catalogueModalRef} {...MODAL_ANIMATION_PROPS} modalStyle={{ backgroundColor: colors.background }}>
                <View className="px-[6%] pt-[9%] pb-[6%]" style={{ maxHeight: MODAL_MAX_HEIGHT }}>
                    <View className="flex gap-0 mb-8">
                        <View className="flex flex-row justify-between items-center">
                            <Text className="text-foreground text-2xl font-medium">Seleccionar catálogo</Text>
                            <Button isIconOnly className="bg-transparent shrink-0" onPress={() => catalogueModalRef.current?.close()}>
                                <Ionicons name="close-outline" size={24} color={colors.foreground} />
                            </Button>
                        </View>
                        <Text className="text-muted-foreground">Seleccione el catálogo del producto</Text>
                    </View>
                    <ScrollView style={{ maxHeight: height * 0.5 }} showsVerticalScrollIndicator={false}>
                        <View className="pb-6">
                            <View className="mb-0">
                                <Text className="text-[12px] font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Catálogos disponibles</Text>
                            </View>
                            <RadioGroup value={String(editedProduct.stockCatalogueId)} onValueChange={(val) => handleInputChange('stockCatalogueId', val)}>
                                {catalogues.map((cat) => (
                                    <RadioGroup.Item
                                        key={cat.id}
                                        value={String(cat.id)}
                                        className="-my-0.5 flex-row items-center p-4 bg-accent-soft rounded-lg border-0"
                                    >
                                        <View className="flex-1">
                                            <RadioGroup.Title className="text-foreground font-medium text-lg">{cat.name}</RadioGroup.Title>
                                        </View>
                                        <RadioGroup.Indicator />
                                    </RadioGroup.Item>
                                ))}
                            </RadioGroup>
                        </View>
                    </ScrollView>
                </View>
            </Modalize>

            {/* Modal de selección de estado */}
            <Modalize ref={statusModalRef} {...MODAL_ANIMATION_PROPS} modalStyle={{ backgroundColor: colors.background }}>
                <View className="px-[6%] pt-[9%] pb-[6%]" style={{ maxHeight: MODAL_MAX_HEIGHT }}>
                    <View className="flex gap-0 mb-8">
                        <View className="flex flex-row justify-between items-center">
                            <Text className="text-foreground text-2xl font-medium">Seleccionar estado</Text>
                            <Button isIconOnly className="bg-transparent shrink-0" onPress={() => statusModalRef.current?.close()}>
                                <Ionicons name="close-outline" size={24} color={colors.foreground} />
                            </Button>
                        </View>
                        <Text className="text-muted-foreground">Seleccione el estado del producto</Text>
                    </View>
                    <ScrollView style={{ maxHeight: height * 0.5 }} showsVerticalScrollIndicator={false}>
                        <View className="pb-6">
                            <View className="mb-0">
                                <Text className="text-[12px] font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Estados disponibles</Text>
                            </View>
                            <RadioGroup value={String(editedProduct.productStatusId)} onValueChange={(val) => handleInputChange('productStatusId', val)}>
                                {statuses.map((status) => (
                                    <RadioGroup.Item
                                        key={status.id}
                                        value={String(status.id)}
                                        className="-my-0.5 flex-row items-center p-4 bg-accent-soft rounded-lg border-0"
                                    >
                                        <View className="flex-1">
                                            <RadioGroup.Title className="text-foreground font-medium text-lg">{status.name}</RadioGroup.Title>
                                        </View>
                                        <RadioGroup.Indicator />
                                    </RadioGroup.Item>
                                ))}
                            </RadioGroup>
                        </View>
                    </ScrollView>
                </View>
            </Modalize>
        </>
    )
}

// =====================================================================
// MODAL DE ESCÁNER QR
// =====================================================================
// =====================================================================
// MODAL DE ESCÁNER QR (ESTILO HOMESCREEN)
// =====================================================================
const QrScannerModalContent = ({ modalRef, onScanSuccess, alertRef }) => {
    const { colors } = useTheme()
    const [permission, requestPermission] = useCameraPermissions()
    const [scanned, setScanned] = useState(false)

    useEffect(() => {
        if (permission === null) {
            requestPermission()
        }
    }, [permission])

    const handleBarCodeScanned = async ({ data }) => {
        if (scanned) return
        setScanned(true)

        try {
            const response = await getProductByQrHash(data)
            if (response?.data) {
                modalRef.current?.close()
                setTimeout(() => {
                    onScanSuccess(response.data)
                }, 300)
            } else {
                alertRef.current?.show('Error', 'Producto no encontrado', 'error')
                setScanned(false)
            }
        } catch (error) {
            console.error('Error scanning QR:', error)
            alertRef.current?.show('Error', 'No se pudo obtener el producto', 'error')
            setScanned(false)
        }
    }

    const onClose = () => {
        setScanned(false)
        modalRef.current?.close()
    }

    if (permission === null) {
        return (
            <Modalize ref={modalRef} {...MODAL_ANIMATION_PROPS} modalStyle={{ backgroundColor: colors.background }}>
                <View style={{ maxHeight: MODAL_MAX_HEIGHT }}>
                    <View className="p-[6%] items-center justify-center" style={{ minHeight: 300 }}>
                        <Spinner color={colors.accent} size="lg" />
                        <Text className="text-foreground mt-4">Solicitando permisos de cámara...</Text>
                    </View>
                </View>
            </Modalize>
        )
    }

    if (!permission.granted) {
        return (
            <Modalize ref={modalRef} {...MODAL_ANIMATION_PROPS} modalStyle={{ backgroundColor: colors.background }}>
                <View style={{ maxHeight: MODAL_MAX_HEIGHT }}>
                    <View className="p-[6%] items-center justify-center" style={{ minHeight: 300 }}>
                        <Ionicons name="scan-outline" size={64} color={colors.muted} />
                        <Text className="text-foreground text-lg font-medium mt-4 text-center">Permisos de cámara requeridos</Text>
                        <Text className="text-muted-foreground text-center mt-2 px-4">Necesitamos acceso a tu cámara para escanear códigos QR</Text>
                        <Button className="mt-6 bg-accent" onPress={requestPermission}>
                            <Button.Label>Conceder permisos</Button.Label>
                        </Button>
                        <Button className="mt-3 bg-transparent" onPress={onClose}>
                            <Button.Label>Cancelar</Button.Label>
                        </Button>
                    </View>
                </View>
            </Modalize>
        )
    }

    return (
        <Modalize ref={modalRef} {...MODAL_ANIMATION_PROPS} modalStyle={{ backgroundColor: colors.background }}>
            <View style={{ maxHeight: MODAL_MAX_HEIGHT, flex: 1 }}>
                <View className="p-[6%]">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-foreground text-xl font-medium">Escanear código QR</Text>
                        <Button isIconOnly className="bg-transparent shrink-0" onPress={onClose}>
                            <Ionicons name="close-outline" size={24} color={colors.foreground} />
                        </Button>
                    </View>
                    <View className="aspect-square w-[100%] rounded-lg overflow-hidden">
                        <CameraView
                            style={{ flex: 1 }}
                            facing="back"
                            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                            barcodeScannerSettings={{
                                barcodeTypes: ['qr'],
                            }}
                        />
                    </View>
                    <Text className="text-muted-foreground text-center mt-4">Apunta la cámara hacia el código QR del producto</Text>
                </View>
            </View>
        </Modalize>
    )
}

// =====================================================================
// MODAL DE DETALLES DEL PRODUCTO (DESDE QR)
// =====================================================================
const ProductDetailsModalContent = ({ modalRef, product, onEdit, alertRef, catalogues, statuses }) => {
    const { colors } = useTheme()

    const onClose = () => modalRef.current?.close()

    const getCatalogueName = (id) => {
        const cat = catalogues.find((c) => c.id === id)
        return cat ? cat.name : 'Sin catálogo'
    }

    const getStatusName = (id) => {
        const status = statuses.find((s) => s.id === id)
        return status ? status.name : 'Sin estado'
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })
    }

    const handleEdit = () => {
        onClose()
        setTimeout(() => {
            if (onEdit) onEdit(product)
        }, 300)
    }

    return (
        <Modalize ref={modalRef} {...MODAL_ANIMATION_PROPS} modalStyle={{ backgroundColor: colors.background }}>
            <View style={{ maxHeight: MODAL_MAX_HEIGHT }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingHorizontal: '6%', paddingTop: '9%', paddingBottom: '6%' }}
                >
                    {product ? (
                        <>
                            <View className="flex gap-0 mb-8">
                                <View className="flex flex-row justify-between items-center">
                                    <Text className="text-foreground text-2xl font-medium">Detalles del producto</Text>
                                    <Button isIconOnly className="bg-transparent shrink-0" onPress={onClose}>
                                        <Ionicons name="close-outline" size={24} color={colors.foreground} />
                                    </Button>
                                </View>
                                <Text className="text-muted-foreground">Información del producto escaneado</Text>
                            </View>

                            <View className="gap-4">
                                <View className="flex-row items-start justify-between">
                                    <Text className="text-[14px] text-muted-foreground w-32 pt-0.5">Nombre</Text>
                                    <Text className="text-[14px] text-foreground text-right flex-1 font-medium" numberOfLines={2}>
                                        {product.nombre || 'N/A'}
                                    </Text>
                                </View>
                                <View className="flex-row items-start justify-between">
                                    <Text className="text-[14px] text-muted-foreground w-32 pt-0.5">Código</Text>
                                    <Text className="text-[14px] text-foreground text-right flex-1" numberOfLines={2}>
                                        {product.codigo || 'N/A'}
                                    </Text>
                                </View>
                                <View className="flex-row items-start justify-between">
                                    <Text className="text-[14px] text-muted-foreground w-32 pt-0.5">Lote</Text>
                                    <Text className="text-[14px] text-foreground text-right flex-1" numberOfLines={2}>
                                        {product.lote || 'N/A'}
                                    </Text>
                                </View>
                                <View className="flex-row items-start justify-between">
                                    <Text className="text-[14px] text-muted-foreground w-32 pt-0.5">Catálogo</Text>
                                    <Text className="text-[14px] text-foreground text-right flex-1" numberOfLines={2}>
                                        {getCatalogueName(product.stockCatalogueId)}
                                    </Text>
                                </View>
                                <View className="flex-row items-start justify-between">
                                    <Text className="text-[14px] text-muted-foreground w-32 pt-0.5">Estado</Text>
                                    <Text className="text-[14px] text-foreground text-right flex-1" numberOfLines={2}>
                                        {getStatusName(product.productStatusId)}
                                    </Text>
                                </View>
                                <View className="flex-row items-start justify-between">
                                    <Text className="text-[14px] text-muted-foreground w-32 pt-0.5">Fecha ingreso</Text>
                                    <Text className="text-[14px] text-foreground text-right flex-1" numberOfLines={2}>
                                        {formatDate(product.fecha)}
                                    </Text>
                                </View>
                                <View className="flex-row items-start justify-between">
                                    <Text className="text-[14px] text-muted-foreground w-32 pt-0.5">Caducidad</Text>
                                    <Text className="text-[14px] text-foreground text-right flex-1" numberOfLines={2}>
                                        {formatDate(product.caducidad)}
                                    </Text>
                                </View>
                                <View className="flex-row items-start justify-between">
                                    <Text className="text-[14px] text-muted-foreground w-32 pt-0.5">Reanálisis</Text>
                                    <Text
                                        className={`text-[14px] text-right flex-1 ${product.reanalisis ? 'text-foreground' : 'text-muted-foreground italic'}`}
                                        numberOfLines={2}
                                    >
                                        {product.reanalisis ? formatDate(product.reanalisis) : 'No especificado'}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row justify-end gap-3 pt-8">
                                <Button className="flex-1" variant="primary" onPress={handleEdit}>
                                    <Ionicons name="create-outline" size={24} color={colors.accentForeground} />
                                    <Button.Label>Editar</Button.Label>
                                </Button>
                            </View>
                        </>
                    ) : (
                        <View className="h-20" />
                    )}
                </ScrollView>
            </View>
        </Modalize>
    )
}

// =====================================================================
// PANTALLA PRINCIPAL - PRODUCTS SCREEN
// =====================================================================
const ProductsScreen = () => {
    const route = useRoute()
    const [isLoading, setIsLoading] = useState(true)
    const [products, setProducts] = useState([])
    const [catalogues, setCatalogues] = useState([])
    const [statuses, setStatuses] = useState([])
    const { colors } = useTheme()

    // Estados de filtros
    const [searchValue, setSearchValue] = useState('')
    const [sortOption, setSortOption] = useState({ value: 'nombre', label: 'Nombre' })
    const [catalogueFilter, setCatalogueFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [rowsPerPage, setRowsPerPage] = useState('10')
    const [page, setPage] = useState(1)

    // Referencias y estados para Modales
    const filterModalRef = useRef(null)
    const createModalRef = useRef(null)
    const editModalRef = useRef(null)
    const viewQrModalRef = useRef(null)
    const qrScannerModalRef = useRef(null)
    const productDetailsModalRef = useRef(null)
    const alertRef = useRef(null)

    const [productToViewQr, setProductToViewQr] = useState(null)
    const [productToEdit, setProductToEdit] = useState(null)
    const [scannedProduct, setScannedProduct] = useState(null)

    // Handlers para abrir modales
    const openFilterModal = () => filterModalRef.current?.open()
    const openCreateModal = () => {
        requestAnimationFrame(() => {
            createModalRef.current?.open()
        })
    }
    const openViewQrModal = (product) => {
        setProductToViewQr(product)
        setTimeout(() => {
            viewQrModalRef.current?.open()
        }, 0)
    }

    const openQrScannerModal = () => {
        requestAnimationFrame(() => {
            qrScannerModalRef.current?.open()
        })
    }

    const handleScanSuccess = (product) => {
        setScannedProduct(product)
        setTimeout(() => {
            productDetailsModalRef.current?.open()
        }, 300)
    }

    const handleEditFromDetails = (product) => {
        setProductToEdit(product)
        setTimeout(() => {
            editModalRef.current?.open()
        }, 0)
    }

    const fetchData = async () => {
        try {
            setIsLoading(true)

            // Obtener productos
            const productsResponse = await getProducts()
            const productsList = productsResponse?.data?.content || []

            setProducts(productsList)

            // Obtener catálogos
            const cataloguesResponse = await getStockCatalogues()
            const cataloguesList = cataloguesResponse?.data?.content || []

            setCatalogues(cataloguesList)

            // Obtener estados
            const statusesResponse = await getProductStatuses()
            if (statusesResponse?.data) {
                setStatuses(statusesResponse.data)
            }
        } catch (err) {
            console.error('Error fetch:', err)
            alertRef.current?.show('Error', 'No se pudieron cargar los datos', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Manejar producto escaneado desde navegación
    useFocusEffect(
        React.useCallback(() => {
            const scannedProductFromRoute = route.params?.scannedProduct
            if (scannedProductFromRoute) {
                setScannedProduct(scannedProductFromRoute)
                setTimeout(() => {
                    productDetailsModalRef.current?.open()
                }, 500)
                // Limpiar el parámetro para evitar que se abra cada vez que se enfoque la pantalla
                route.params.scannedProduct = undefined
            }
        }, [route.params]),
    )

    useEffect(() => {
        setPage(1)
    }, [searchValue, catalogueFilter, statusFilter, rowsPerPage])

    const filteredAndSortedItems = useMemo(() => {
        let result = [...products]

        // Filtro de búsqueda
        if (searchValue) {
            const lowerSearch = searchValue.toLowerCase()
            result = result.filter(
                (product) =>
                    product.nombre?.toLowerCase().includes(lowerSearch) ||
                    product.lote?.toLowerCase().includes(lowerSearch) ||
                    product.codigo?.toLowerCase().includes(lowerSearch),
            )
        }

        // Filtro por catálogo
        if (catalogueFilter && catalogueFilter !== 'all') {
            result = result.filter((product) => product.stockCatalogueId === Number(catalogueFilter))
        }

        // Filtro por estado
        if (statusFilter && statusFilter !== 'all') {
            result = result.filter((product) => product.productStatusId === Number(statusFilter))
        }

        // Ordenamiento
        if (sortOption?.value) {
            const key = sortOption.value
            const keyString = (product) => (product[key] || '').toString().toLowerCase()
            result.sort((a, b) => keyString(a).localeCompare(keyString(b)))
        }

        return result
    }, [products, searchValue, catalogueFilter, statusFilter, sortOption])

    const pages = Math.ceil(filteredAndSortedItems.length / Number(rowsPerPage))

    const paginatedItems = useMemo(() => {
        const start = (page - 1) * Number(rowsPerPage)
        return filteredAndSortedItems.slice(start, start + Number(rowsPerPage))
    }, [page, filteredAndSortedItems, rowsPerPage])

    // Función helper para obtener nombre del catálogo
    const getCatalogueName = (id) => {
        const cat = catalogues.find((c) => c.id === id)
        return cat ? cat.name : 'Sin catálogo'
    }

    // Función helper para obtener nombre del estado
    const getStatusName = (id) => {
        const status = statuses.find((s) => s.id === id)
        return status ? status.name : 'Sin estado'
    }

    // Función para formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollableLayout onRefresh={fetchData}>
                <View className="p-[6%] min-h-full">
                    <View className="flex flex-col w-full justify-between shrink-0 gap-4 items-end">
                        <View className="w-full flex flex-row justify-between items-center">
                            <Text className="font-bold text-[32px] text-foreground">Productos</Text>
                            <View className="flex flex-row gap-0 items-center">
                                <Button isIconOnly className="size-12 bg-transparent shrink-0" isDisabled={isLoading} onPress={openQrScannerModal}>
                                    <Ionicons name="scan-outline" size={24} color={colors.accent} />
                                </Button>
                                <Button isIconOnly className="size-12 bg-transparent shrink-0" isDisabled={isLoading} onPress={openFilterModal}>
                                    <Ionicons name="filter-outline" size={24} color={colors.foreground} />
                                </Button>
                                <Button
                                    isIconOnly
                                    className="size-12 font-semibold shrink-0"
                                    variant="primary"
                                    isDisabled={isLoading}
                                    onPress={openCreateModal}
                                >
                                    <Ionicons name="add-outline" size={24} color={colors.accentForeground} />
                                </Button>
                            </View>
                        </View>
                    </View>

                    <View className="mb-4 mt-4 flex-row justify-between items-center">
                        <Text className="text-[14px] text-muted-foreground">{filteredAndSortedItems.length} Resultados</Text>
                        <View className="flex flex-row gap-2">
                            <View className="flex-row items-center bg-surface-1 px-2 py-2 rounded-full gap-1">
                                <Ionicons name="swap-vertical-outline" size={12} color={colors.foreground} />
                                <Text className="text-xs font-semibold text-foreground">{sortOption.label}</Text>
                            </View>
                            <View className="flex-row items-center bg-surface-1 px-2 py-2 rounded-lg">
                                <Text className="text-xs font-semibold text-foreground">{rowsPerPage} / Pág</Text>
                            </View>
                            {(catalogueFilter !== 'all' || statusFilter !== 'all') && (
                                <View className="flex-row items-center bg-surface-1 px-2 py-2 rounded-lg gap-1">
                                    <Ionicons name="funnel-outline" size={12} color={colors.accent} />
                                    <Text className="text-xs font-semibold text-foreground">Filtros</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <TextField className="mb-4">
                        <TextField.Input
                            colors={{
                                blurBackground: colors.accentSoft,
                                focusBackground: colors.surface2,
                                blurBorder: colors.accentSoft,
                                focusBorder: colors.surface2,
                            }}
                            placeholder="Buscar por nombre, lote o código..."
                            autoCapitalize="none"
                            cursorColor={colors.accent}
                            selectionHandleColor={colors.accent}
                            selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                            value={searchValue}
                            onChangeText={setSearchValue}
                        >
                            <TextField.InputEndContent>
                                <Ionicons name="search-outline" size={24} color={colors.muted} />
                            </TextField.InputEndContent>
                        </TextField.Input>
                    </TextField>

                    {isLoading ? (
                        <View className="absolute inset-0 justify-center items-center z-50">
                            <Spinner color={colors.foreground} size="md" />
                        </View>
                    ) : (
                        <ScrollShadow className="w-full" size={20} LinearGradientComponent={LinearGradient}>
                            <View className="p-0">
                                {paginatedItems.length > 0 ? (
                                    <>
                                        <Accordion selectionMode="single" className="border-0" isDividerVisible={false}>
                                            {paginatedItems.map((item) => (
                                                <Accordion.Item
                                                    key={item.id}
                                                    value={item.id}
                                                    className="bg-accent-soft mb-2 rounded-lg overflow-hidden border border-border/20"
                                                >
                                                    {/* HEADER / TRIGGER */}
                                                    <Accordion.Trigger className="w-full bg-accent-soft pl-4 pr-0 py-2">
                                                        <View className="flex-row items-center justify-between w-full">
                                                            {/* TEXTOS: Tipografía solicitada */}
                                                            <View className="flex-1 pr-4 justify-center py-1">
                                                                <Text className="text-foreground font-medium text-lg mb-1" numberOfLines={1}>
                                                                    {item.lote}
                                                                </Text>
                                                                <Text className="text-muted-foreground text-[14px]" numberOfLines={1}>
                                                                    {item.nombre}
                                                                </Text>
                                                            </View>

                                                            {/* ACCIONES: Área de 48x48 (w-12 h-12) con íconos de 24 */}
                                                            <View className="flex flex-row items-center gap-0">
                                                                {item.qrHash && (
                                                                    <TouchableOpacity
                                                                        onPress={() => openViewQrModal(item)}
                                                                        className="w-12 h-12 flex items-center justify-center rounded-full"
                                                                        activeOpacity={0.6}
                                                                    >
                                                                        <Ionicons name="qr-code-outline" size={24} color={colors.accent} />
                                                                    </TouchableOpacity>
                                                                )}

                                                                <TouchableOpacity
                                                                    onPress={() => handleEditFromDetails(item)}
                                                                    className="w-12 h-12 flex items-center justify-center rounded-full"
                                                                    activeOpacity={0.6}
                                                                >
                                                                    <Ionicons name="create-outline" size={24} color={colors.accent} />
                                                                </TouchableOpacity>

                                                                {/* Indicador también ajustado al área de toque */}
                                                                <View className="w-12 h-12 flex items-center justify-center">
                                                                    <Accordion.Indicator
                                                                        iconProps={{
                                                                            color: colors.accent,
                                                                            size: 24, // Tamaño solicitado
                                                                        }}
                                                                    />
                                                                </View>
                                                            </View>
                                                        </View>
                                                    </Accordion.Trigger>

                                                    {/* CONTENT: Compacto pero legible */}
                                                    <Accordion.Content className="bg-accent-soft px-4 pb-4">
                                                        {/* Separador sutil */}
                                                        <View className="h-px bg-border/30 mt-0 mb-3" />

                                                        {/* Lista de datos con gap reducido (compacto) */}
                                                        <View className="gap-2">
                                                            <InfoRow label="Código" value={item.codigo || 'N/A'} />
                                                            <InfoRow label="Catálogo" value={getCatalogueName(item.stockCatalogueId)} />
                                                            <InfoRow label="Estado" value={getStatusName(item.productStatusId)} />
                                                            <InfoRow label="Fecha ingreso" value={formatDate(item.fecha)} />
                                                            <InfoRow label="Caducidad" value={formatDate(item.caducidad)} />

                                                            <View className="flex-row items-start justify-between">
                                                                <Text className="text-[14px] text-muted-foreground w-24 pt-0.5">Reánalisis</Text>
                                                                <Text
                                                                    className={`text-[14px] text-right flex-1 font-medium ${
                                                                        item.reanalisis ? 'text-foreground' : 'text-muted-foreground italic'
                                                                    }`}
                                                                    numberOfLines={2}
                                                                >
                                                                    {item.reanalisis ? formatDate(item.reanalisis) : 'No especificado'}
                                                                </Text>
                                                            </View>

                                                            <InfoRow label="Por" value={item.createdByUserName} />
                                                            <InfoRow label="Creado" value={formatDateLiteral(item.createdAt, true)} />
                                                            <InfoRow label="Actualizado" value={formatDateLiteral(item.updatedAt, true)} />
                                                        </View>
                                                    </Accordion.Content>
                                                </Accordion.Item>
                                            ))}
                                        </Accordion>
                                        <View className="items-end mt-2">
                                            <View className="flex-row items-center justify-between rounded-lg">
                                                <Button
                                                    isIconOnly
                                                    className="bg-transparent"
                                                    isDisabled={page === 1}
                                                    onPress={() => setPage((p) => Math.max(1, p - 1))}
                                                >
                                                    <Ionicons name="chevron-back-outline" size={24} color={page === 1 ? colors.muted : colors.accent} />
                                                    <Text className="text-foreground">{page}</Text>
                                                </Button>
                                                <Button
                                                    isIconOnly
                                                    className="bg-transparent"
                                                    isDisabled={page === pages || pages === 0}
                                                    onPress={() => setPage((p) => Math.min(pages, p + 1))}
                                                >
                                                    <Text className="text-muted-foreground">/ {pages || 1}</Text>
                                                    <Ionicons
                                                        name="chevron-forward-outline"
                                                        size={24}
                                                        color={page === pages || pages === 0 ? colors.muted : colors.accent}
                                                    />
                                                </Button>
                                            </View>
                                        </View>
                                    </>
                                ) : (
                                    <Text className="text-center mt-4 text-muted-foreground">No se encontraron productos.</Text>
                                )}
                            </View>
                        </ScrollShadow>
                    )}
                </View>
            </ScrollableLayout>

            <FiltersModalContent
                modalRef={filterModalRef}
                sortOption={sortOption}
                setSortOption={setSortOption}
                catalogueFilter={catalogueFilter}
                setCatalogueFilter={setCatalogueFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                rowsPerPage={rowsPerPage}
                setRowsPerPage={setRowsPerPage}
                setPage={setPage}
                catalogues={catalogues}
                statuses={statuses}
            />
            <CreateProductModalContent
                modalRef={createModalRef}
                onProductCreated={fetchData}
                isLoading={isLoading}
                alertRef={alertRef}
                catalogues={catalogues}
                statuses={statuses}
            />
            <EditProductModalContent
                modalRef={editModalRef}
                product={productToEdit}
                onProductUpdated={fetchData}
                alertRef={alertRef}
                catalogues={catalogues}
                statuses={statuses}
            />
            <QrScannerModalContent modalRef={qrScannerModalRef} onScanSuccess={handleScanSuccess} alertRef={alertRef} />
            <ProductDetailsModalContent
                modalRef={productDetailsModalRef}
                product={scannedProduct}
                onEdit={handleEditFromDetails}
                alertRef={alertRef}
                catalogues={catalogues}
                statuses={statuses}
            />
            <ViewQrModalContent modalRef={viewQrModalRef} product={productToViewQr} alertRef={alertRef} />
            <CustomAlert ref={alertRef} />
        </View>
    )
}

export default ProductsScreen
