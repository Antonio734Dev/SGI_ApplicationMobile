import React, { useEffect, useState, useMemo, useRef } from 'react'
import { Text, View, TouchableOpacity, Platform, Dimensions } from 'react-native'
import ScrollableLayout from '../../layouts/ScrollableLayout'
import { Accordion, Button, RadioGroup, ScrollShadow, Spinner, Switch, TextField, useTheme } from 'heroui-native'
import { getUsersRequest, updateUser, changeStatus, createUser } from '../../services/user'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { formatDateLiteral } from '../../utils/utils'
import { Modalize } from 'react-native-modalize'
import { ScrollView } from 'react-native-gesture-handler'

const { height } = Dimensions.get('window')
const MODAL_MAX_HEIGHT = height * 0.75
const OVERLAY_STYLE = { backgroundColor: 'rgba(0, 0, 0, 0.2)' }

// =====================================================================
// CONSTANTES
// =====================================================================
const ROLE_OPTIONS = [
    { value: '1', label: 'Administrador' },
    { value: '2', label: 'Usuario' },
]

const getRoleLabel = (id) => {
    const role = ROLE_OPTIONS.find((r) => r.value == id)
    return role ? role.label : 'Seleccionar Rol'
}

// =====================================================================
// 1. MODAL DE FILTROS
// =====================================================================
// Asegúrate de importar RadioGroup de heroui-native al inicio de tu archivo
// import { RadioGroup, ... } from 'heroui-native';

const FiltersModalContent = ({ modalRef, sortOption, setSortOption, statusFilter, setStatusFilter, rowsPerPage, setRowsPerPage, setPage }) => {
    const { colors } = useTheme()

    const onClose = () => {
        modalRef.current?.close()
    }

    // Definimos las opciones por separado para mapearlas limpiamente
    const sortOptions = [
        { label: 'Nombre', value: 'name' },
        { label: 'Correo', value: 'email' },
        { label: 'Puesto', value: 'position' },
        { label: 'Rol', value: 'role' },
    ]

    const statusOptions = [
        { label: 'Todos los estatus', value: 'all' },
        { label: 'Activo', value: 'activo' },
        { label: 'Inactivo', value: 'inactivo' },
    ]

    const rowsOptions = [
        { label: '5 filas', value: '5' },
        { label: '10 filas', value: '10' },
        { label: '20 filas', value: '20' },
        { label: '50 filas', value: '50' },
    ]

    // Handlers específicos para cada grupo
    const handleSortChange = (val) => {
        const selectedLabel = sortOptions.find((opt) => opt.value === val)?.label
        setSortOption({ value: val, label: selectedLabel })
        // onClose() // Descomenta si quieres que se cierre al seleccionar
    }

    const handleStatusChange = (val) => {
        setStatusFilter(val)
        // onClose()
    }

    const handleRowsChange = (val) => {
        setRowsPerPage(val)
        setPage(1)
        // onClose()
    }

    return (
        <Modalize
            ref={modalRef}
            adjustToContentHeight={true}
            avoidKeyboardLikeIOS={true}
            overlayStyle={OVERLAY_STYLE}
            modalStyle={{ backgroundColor: colors.background }}
        >
            <View style={{ maxHeight: MODAL_MAX_HEIGHT }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: '6%',
                        paddingTop: '9%',
                        paddingBottom: '6%',
                    }}
                >
                    {/* Header del Modal */}
                    <View className="flex gap-0 mb-8">
                        <View className="flex flex-row justify-between items-center">
                            <Text className="text-foreground text-2xl font-medium">Opciones</Text>
                            <Button isIconOnly className="bg-transparent shrink-0" onPress={onClose}>
                                <Ionicons name="close-outline" size={24} color={colors.foreground} />
                            </Button>
                        </View>
                        <Text className="text-muted-foreground">Ordena y filtra tus resultados</Text>
                    </View>

                    <View className="gap-6 pb-4">
                        {/* GRUPO 1: ORDENAR POR */}
                        <View>
                            <View className="bg-surface-1 rounded-lg p-2 mb-2">
                                <Text className="text-[12px] font-semibold text-muted-foreground">Ordenar por</Text>
                            </View>
                            <RadioGroup value={sortOption.value} onValueChange={handleSortChange}>
                                {sortOptions.map((opt) => (
                                    <RadioGroup.Item
                                        key={opt.value}
                                        value={opt.value}
                                        className="flex-row justify-between items-center h-14 pr-4 border-b border-surface-2"
                                    >
                                        <RadioGroup.Title className="text-foreground">{opt.label}</RadioGroup.Title>
                                        <RadioGroup.Indicator />
                                    </RadioGroup.Item>
                                ))}
                            </RadioGroup>
                        </View>

                        {/* GRUPO 2: FILTRAR POR ESTADO */}
                        <View>
                            <View className="bg-surface-1 rounded-lg p-2 mb-2">
                                <Text className="text-[12px] font-semibold text-muted-foreground">Filtrar por estado</Text>
                            </View>
                            <RadioGroup value={statusFilter} onValueChange={handleStatusChange}>
                                {statusOptions.map((opt) => (
                                    <RadioGroup.Item
                                        key={opt.value}
                                        value={opt.value}
                                        className="flex-row justify-between items-center h-14 pr-4 border-b border-surface-2"
                                    >
                                        <RadioGroup.Title className="text-foreground">{opt.label}</RadioGroup.Title>
                                        <RadioGroup.Indicator />
                                    </RadioGroup.Item>
                                ))}
                            </RadioGroup>
                        </View>

                        {/* GRUPO 3: FILAS POR PÁGINA */}
                        <View>
                            <View className="bg-surface-1 rounded-lg p-2 mb-2">
                                <Text className="text-[12px] font-semibold text-muted-foreground">Filas por página</Text>
                            </View>
                            <RadioGroup value={rowsPerPage} onValueChange={handleRowsChange}>
                                {rowsOptions.map((opt) => (
                                    <RadioGroup.Item
                                        key={opt.value}
                                        value={opt.value}
                                        className="flex-row justify-between items-center h-14 pr-4 border-b border-surface-2"
                                    >
                                        <RadioGroup.Title className="text-foreground">{opt.label}</RadioGroup.Title>
                                        <RadioGroup.Indicator />
                                    </RadioGroup.Item>
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
// 2. MODAL DE EDICIÓN
// =====================================================================
const EditUserModalContent = ({ modalRef, user, onUserUpdated }) => {
    const { colors } = useTheme()
    const roleModalRef = useRef(null)
    const [isSaving, setIsSaving] = useState(false)
    const [editedUser, setEditedUser] = useState({ name: '', email: '', position: '', phone: '', roleId: 1 })

    useEffect(() => {
        if (user) {
            setEditedUser({ ...user })
        }
    }, [user])

    const onClose = () => {
        modalRef.current?.close()
    }

    const handleSave = async () => {
        if (!editedUser.name || !editedUser.name.trim() || !editedUser.email.trim() || !editedUser.position.trim()) {
            alert('Campos obligatorios faltantes')
            return
        }
        try {
            setIsSaving(true)
            const userToUpdate = {
                id: editedUser.id,
                name: editedUser.name.trim(),
                email: editedUser.email.trim(),
                position: editedUser.position.trim(),
                phone: editedUser.phone?.trim() || '',
                roleId: editedUser.roleId,
            }
            const response = await updateUser(userToUpdate)
            if (response.type === 'SUCCESS') {
                alert(`Usuario ${editedUser.name} actualizado correctamente`)
                onClose()
                if (onUserUpdated) onUserUpdated()
            } else {
                alert('No se pudo actualizar el usuario')
            }
        } catch (error) {
            console.error('Error update:', error)
            alert(error.response?.data?.message || 'Error al actualizar')
        } finally {
            setIsSaving(false)
        }
    }

    const openRoles = () => roleModalRef.current?.open()
    const selectRole = (val) => {
        setEditedUser({ ...editedUser, roleId: Number(val) })
    }

    return (
        <>
            <Modalize
                ref={modalRef}
                adjustToContentHeight={true}
                avoidKeyboardLikeIOS={true}
                overlayStyle={OVERLAY_STYLE}
                modalStyle={{ backgroundColor: colors.background }}
            >
                <View style={{ maxHeight: MODAL_MAX_HEIGHT }}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{
                            paddingHorizontal: '6%',
                            paddingTop: '9%',
                            paddingBottom: '6%',
                        }}
                    >
                        {user ? (
                            <>
                                <View className="flex gap-0 mb-8">
                                    <View className="flex flex-row justify-between items-center">
                                        <Text className="text-foreground text-2xl font-medium">Editar usuario</Text>
                                        <Button isIconOnly className="bg-transparent shrink-0" onPress={onClose}>
                                            <Ionicons name="close-outline" size={24} color={colors.foreground} />
                                        </Button>
                                    </View>
                                    <Text className="text-muted-foreground">Edite los datos del usuario</Text>
                                </View>

                                <View className="gap-6">
                                    <TextField isRequired>
                                        <TextField.Label className="text-foreground font-medium mb-2">Nombre</TextField.Label>
                                        <TextField.Input
                                            colors={{
                                                blurBackground: colors.accentSoft,
                                                focusBackground: colors.surface2,
                                                blurBorder: colors.accentSoft,
                                                focusBorder: colors.surface2,
                                            }}
                                            placeholder="Nombre del usuario"
                                            value={editedUser.name}
                                            onChangeText={(text) => setEditedUser((prev) => ({ ...prev, name: text }))}
                                            cursorColor={colors.accent}
                                            selectionHandleColor={colors.accent}
                                            selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                        />
                                    </TextField>
                                    <TextField isRequired>
                                        <TextField.Label className="text-foreground font-medium mb-2">Correo electrónico </TextField.Label>
                                        <TextField.Input
                                            colors={{
                                                blurBackground: colors.accentSoft,
                                                focusBackground: colors.surface2,
                                                blurBorder: colors.accentSoft,
                                                focusBorder: colors.surface2,
                                            }}
                                            placeholder="correo@ejemplo.com"
                                            value={editedUser.email}
                                            onChangeText={(text) => setEditedUser((prev) => ({ ...prev, email: text }))}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            cursorColor={colors.accent}
                                            selectionHandleColor={colors.accent}
                                            selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                        />
                                    </TextField>
                                    <TextField isRequired>
                                        <TextField.Label className="text-foreground font-medium mb-2">Puesto</TextField.Label>
                                        <TextField.Input
                                            colors={{
                                                blurBackground: colors.accentSoft,
                                                focusBackground: colors.surface2,
                                                blurBorder: colors.accentSoft,
                                                focusBorder: colors.surface2,
                                            }}
                                            placeholder="Puesto del usuario"
                                            value={editedUser.position}
                                            onChangeText={(text) => setEditedUser((prev) => ({ ...prev, position: text }))}
                                            cursorColor={colors.accent}
                                            selectionHandleColor={colors.accent}
                                            selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                        />
                                    </TextField>
                                    <View style={{ zIndex: 1000 }}>
                                        <Text className="text-foreground font-medium mb-2">
                                            Rol <Text className="text-danger">*</Text>
                                        </Text>
                                        <TouchableOpacity onPress={openRoles}>
                                            <View className="w-full h-12 flex-row items-center justify-between px-4 rounded-lg bg-accent-soft">
                                                <Text className="text-foreground font-medium">{getRoleLabel(editedUser.roleId)}</Text>
                                                <Ionicons name="chevron-down-outline" size={24} color={colors.accent} />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <TextField>
                                        <TextField.Label className="text-foreground font-medium mb-2">Teléfono</TextField.Label>
                                        <TextField.Input
                                            colors={{
                                                blurBackground: colors.accentSoft,
                                                focusBackground: colors.surface2,
                                                blurBorder: colors.accentSoft,
                                                focusBorder: colors.surface2,
                                            }}
                                            placeholder="Teléfono (Opcional)"
                                            value={editedUser.phone}
                                            onChangeText={(text) => setEditedUser((prev) => ({ ...prev, phone: text }))}
                                            keyboardType="phone-pad"
                                            cursorColor={colors.accent}
                                            selectionHandleColor={colors.accent}
                                            selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                        />
                                    </TextField>
                                </View>

                                <View className="flex-row justify-end gap-3 pt-8">
                                    <Button
                                        className="flex-1"
                                        variant="primary"
                                        onPress={handleSave}
                                        isDisabled={isSaving || !editedUser.name.trim() || !editedUser.email.trim() || !editedUser.position.trim()}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Spinner color={colors.accentForeground} size="md" />
                                                <Button.Label>Guardando...</Button.Label>
                                            </>
                                        ) : (
                                            <>
                                                <Ionicons name="checkmark-outline" size={24} color={colors.accentForeground} />
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

            <Modalize ref={roleModalRef} adjustToContentHeight={true} overlayStyle={OVERLAY_STYLE} modalStyle={{ backgroundColor: colors.background }}>
                <View className="px-[6%] pt-[9%] pb-[6%]" style={{ maxHeight: MODAL_MAX_HEIGHT }}>
                    <View className="flex gap-0 mb-8">
                        <View className="flex flex-row justify-between items-center">
                            <Text className="text-foreground text-2xl font-medium">Seleccionar rol</Text>
                            <Button isIconOnly className="bg-transparent shrink-0" onPress={onClose}>
                                <Ionicons name="close-outline" size={24} color={colors.foreground} />
                            </Button>
                        </View>
                        <Text className="text-muted-foreground">Seleccione el rol nuevo que se asignará al usuario</Text>
                    </View>

                    <RadioGroup value={String(editedUser.roleId)} onValueChange={(val) => selectRole(val)}>
                        {ROLE_OPTIONS.map((role) => (
                            <RadioGroup.Item
                                key={role.value}
                                value={role.value}
                                className="flex-row justify-between items-center h-14 pr-4 border-b border-surface-2"
                            >
                                <RadioGroup.Title className="text-foreground">{role.label}</RadioGroup.Title>
                                <RadioGroup.Indicator />
                            </RadioGroup.Item>
                        ))}
                    </RadioGroup>
                </View>
            </Modalize>
        </>
    )
}

// =====================================================================
// 3. MODAL DE CREACIÓN
// =====================================================================
const CreateUserModalContent = ({ modalRef, onUserCreated, isLoading }) => {
    const { colors } = useTheme()
    const roleModalRef = useRef(null)
    const [isSaving, setIsSaving] = useState(false)
    const [newUser, setNewUser] = useState({ name: '', email: '', position: '', phone: '', roleId: 1 })

    const onClose = () => {
        modalRef.current?.close()
    }

    const openRoles = () => roleModalRef.current?.open()
    const selectRole = (val) => {
        setNewUser({ ...newUser, roleId: Number(val) })
    }

    const handleCreate = async () => {
        if (!newUser.name.trim() || !newUser.email.trim() || !newUser.position.trim()) {
            alert('Campos obligatorios faltantes')
            return
        }
        try {
            setIsSaving(true)
            await createUser(newUser)
            alert('Usuario creado correctamente')
            setNewUser({ name: '', email: '', position: '', phone: '', roleId: 1 })
            onClose()
            if (onUserCreated) onUserCreated()
        } catch (error) {
            alert('No se pudo crear el usuario')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <>
            <Modalize
                ref={modalRef}
                adjustToContentHeight={true}
                avoidKeyboardLikeIOS={true}
                overlayStyle={OVERLAY_STYLE}
                modalStyle={{ backgroundColor: colors.background }}
            >
                <View style={{ maxHeight: MODAL_MAX_HEIGHT }}>
                    {/* 2. ScrollView: Habilita el desplazamiento interno */}
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        // Pasamos el padding del View original aquí para que scrollee con el contenido
                        contentContainerStyle={{
                            paddingHorizontal: '6%',
                            paddingTop: '9%',
                            paddingBottom: '6%',
                        }}
                    >
                        <View className="flex gap-0 mb-8">
                            <View className="flex flex-row justify-between items-center">
                                <Text className="text-foreground text-2xl font-medium">Registrar usuario</Text>

                                <Button isIconOnly className="bg-transparent shrink-0" onPress={onClose}>
                                    <Ionicons name="close-outline" size={24} color={colors.foreground} />
                                </Button>
                            </View>
                            <Text className="text-muted-foreground">Ingrese los datos del nuevo usuario</Text>
                        </View>

                        <View className="gap-6">
                            <TextField isRequired>
                                <TextField.Label className="text-foreground font-medium mb-2">Nombre</TextField.Label>
                                <TextField.Input
                                    colors={{
                                        blurBackground: colors.accentSoft,
                                        focusBackground: colors.surface2,
                                        blurBorder: colors.accentSoft,
                                        focusBorder: colors.surface2,
                                    }}
                                    placeholder="Nombre del usuario"
                                    value={newUser.name}
                                    onChangeText={(text) => setNewUser((prev) => ({ ...prev, name: text }))}
                                    cursorColor={colors.accent}
                                    selectionHandleColor={colors.accent}
                                    selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                />
                            </TextField>
                            <TextField isRequired>
                                <TextField.Label className="text-foreground font-medium mb-2">Correo electrónico</TextField.Label>
                                <TextField.Input
                                    colors={{
                                        blurBackground: colors.accentSoft,
                                        focusBackground: colors.surface2,
                                        blurBorder: colors.accentSoft,
                                        focusBorder: colors.surface2,
                                    }}
                                    placeholder="correo@ejemplo.com"
                                    value={newUser.email}
                                    onChangeText={(text) => setNewUser((prev) => ({ ...prev, email: text }))}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    cursorColor={colors.accent}
                                    selectionHandleColor={colors.accent}
                                    selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                />
                            </TextField>
                            <TextField isRequired>
                                <TextField.Label className="text-foreground font-medium mb-2">Puesto</TextField.Label>
                                <TextField.Input
                                    colors={{
                                        blurBackground: colors.accentSoft,
                                        focusBackground: colors.surface2,
                                        blurBorder: colors.accentSoft,
                                        focusBorder: colors.surface2,
                                    }}
                                    placeholder="Puesto del usuario"
                                    value={newUser.position}
                                    onChangeText={(text) => setNewUser((prev) => ({ ...prev, position: text }))}
                                    cursorColor={colors.accent}
                                    selectionHandleColor={colors.accent}
                                    selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                />
                            </TextField>
                            <View style={{ zIndex: 1000 }}>
                                <Text className="text-foreground font-medium mb-2">
                                    Rol <Text className="text-danger">*</Text>
                                </Text>
                                <TouchableOpacity onPress={openRoles}>
                                    <View className="w-full h-12 flex-row items-center justify-between px-4 rounded-lg bg-accent-soft">
                                        <Text className="text-foreground font-medium">{getRoleLabel(newUser.roleId)}</Text>
                                        <Ionicons name="chevron-down-outline" size={24} color={colors.accent} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <TextField>
                                <TextField.Label className="text-foreground font-medium mb-2">Teléfono</TextField.Label>
                                <TextField.Input
                                    colors={{
                                        blurBackground: colors.accentSoft,
                                        focusBackground: colors.surface2,
                                        blurBorder: colors.accentSoft,
                                        focusBorder: colors.surface2,
                                    }}
                                    placeholder="Teléfono (Opcional)"
                                    value={newUser.phone}
                                    onChangeText={(text) => setNewUser((prev) => ({ ...prev, phone: text }))}
                                    keyboardType="phone-pad"
                                    cursorColor={colors.accent}
                                    selectionHandleColor={colors.accent}
                                    selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                />
                            </TextField>
                        </View>

                        <View className="flex-row justify-end gap-3 pt-8">
                            <Button
                                className="flex-1"
                                variant="primary"
                                onPress={handleCreate}
                                isDisabled={isLoading || isSaving || !newUser.name.trim() || !newUser.email.trim() || !newUser.position.trim()}
                            >
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

            <Modalize ref={roleModalRef} adjustToContentHeight={true} overlayStyle={OVERLAY_STYLE} modalStyle={{ backgroundColor: colors.background }}>
                <View className="px-[6%] pt-[9%] pb-[6%]" style={{ maxHeight: MODAL_MAX_HEIGHT }}>
                    <View className="flex gap-0 mb-8">
                        <View className="flex flex-row justify-between items-center">
                            <Text className="text-foreground text-2xl font-medium">Seleccionar rol</Text>
                            <Button isIconOnly className="bg-transparent shrink-0" onPress={onClose}>
                                <Ionicons name="close-outline" size={24} color={colors.foreground} />
                            </Button>
                        </View>
                        <Text className="text-muted-foreground">Seleccione el rol que se asignará al nuevo usuario</Text>
                    </View>

                    <RadioGroup value={String(newUser.roleId)} onValueChange={(val) => selectRole(val)}>
                        {ROLE_OPTIONS.map((role) => (
                            <RadioGroup.Item
                                key={role.value}
                                value={role.value}
                                className="flex-row justify-between items-center h-14 pr-4 border-b border-surface-2"
                            >
                                <RadioGroup.Title className="text-foreground">{role.label}</RadioGroup.Title>
                                <RadioGroup.Indicator />
                            </RadioGroup.Item>
                        ))}
                    </RadioGroup>
                </View>
            </Modalize>
        </>
    )
}

// =====================================================================
// 4. MODAL DE STATUS
// =====================================================================
const StatusChangeModalContent = ({ modalRef, user, onStatusChanged }) => {
    const { colors } = useTheme()
    const [isChangingStatus, setIsChangingStatus] = useState(false)

    const onClose = () => modalRef.current?.close()

    const handleChangeStatus = async () => {
        try {
            setIsChangingStatus(true)
            const response = await changeStatus(user.email)
            if (response.type === 'SUCCESS') {
                if (onStatusChanged) onStatusChanged()
                onClose()
            } else {
                alert('No se pudo cambiar el estado')
            }
        } catch (error) {
            alert('Error al cambiar estado')
        } finally {
            setIsChangingStatus(false)
        }
    }

    return (
        <Modalize
            ref={modalRef}
            adjustToContentHeight={true}
            avoidKeyboardLikeIOS={true}
            overlayStyle={OVERLAY_STYLE}
            modalStyle={{ backgroundColor: colors.background }}
        >
            <View style={{ maxHeight: MODAL_MAX_HEIGHT }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{
                        paddingHorizontal: '6%',
                        paddingTop: '9%',
                        paddingBottom: '6%',
                    }}
                >
                    {user ? (
                        <View>
                            <View className="flex gap-0 mb-8">
                                <View className="flex flex-row justify-between items-center">
                                    <Text className="text-foreground text-2xl font-medium">
                                        {user.status === 'activo' ? '¿Inhabilitar usuario?' : '¿Habilitar usuario?'}
                                    </Text>
                                    <Button isIconOnly className="bg-transparent shrink-0" onPress={onClose}>
                                        <Ionicons name="close-outline" size={24} color={colors.foreground} />
                                    </Button>
                                </View>
                                <Text className="text-muted-foreground">
                                    {user.status === 'activo'
                                        ? `¿Está seguro que desea inhabilitar a ${user.name}? El usuario no podrá acceder al sistema.`
                                        : `¿Está seguro que desea habilitar a ${user.name}? El usuario podrá acceder al sistema nuevamente.`}
                                </Text>
                            </View>

                            <View className="flex-row justify-end gap-3">
                                <Button className="flex-1" variant="primary" onPress={handleChangeStatus} isDisabled={isChangingStatus}>
                                    {isChangingStatus ? (
                                        <>
                                            <Spinner color={colors.accentForeground} size="md" />
                                            <Button.Label>{user.status === 'activo' ? 'Inhabilitando' : 'Habilitando'}...</Button.Label>
                                        </>
                                    ) : (
                                        <>
                                            <Ionicons
                                                name={user.status === 'activo' ? 'remove-outline' : 'checkmark-outline'}
                                                size={24}
                                                color={colors.accentForeground}
                                            />
                                            <Button.Label>{user.status === 'activo' ? 'Inhabilitar' : 'Habilitar'}</Button.Label>
                                        </>
                                    )}
                                </Button>
                            </View>
                        </View>
                    ) : (
                        <View className="h-20" />
                    )}
                </ScrollView>
            </View>
        </Modalize>
    )
}

// =====================================================================
// PANTALLA PRINCIPAL
// =====================================================================
const UsersScreen = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [users, setUsers] = useState([])
    const { colors } = useTheme()

    // Estados de filtros
    const [searchValue, setSearchValue] = useState('')
    const [sortOption, setSortOption] = useState({ value: 'name', label: 'Nombre' })
    const [statusFilter, setStatusFilter] = useState('all')
    const [rowsPerPage, setRowsPerPage] = useState('10')
    const [page, setPage] = useState(1)

    // NUEVO ESTADO: Controlamos el acordeón para evitar que se cierre al re-renderizar
    const [expandedKeys, setExpandedKeys] = useState(undefined)

    // Referencias y estados para Modales Globales
    const filterModalRef = useRef(null)
    const createModalRef = useRef(null)
    const editModalRef = useRef(null)
    const statusModalRef = useRef(null)

    const [userToEdit, setUserToEdit] = useState(null)
    const [userToChangeStatus, setUserToChangeStatus] = useState(null)

    // Handlers para abrir modales
    const openFilterModal = () => filterModalRef.current?.open()
    const openCreateModal = () => createModalRef.current?.open()

    const openEditModal = (user) => {
        setUserToEdit(user)
        editModalRef.current?.open()
    }

    const openStatusModal = (user) => {
        setUserToChangeStatus(user)
        statusModalRef.current?.open()
    }

    const fetchData = async () => {
        try {
            setIsLoading(true)
            const response = await getUsersRequest()
            if (response?.data) {
                const dataCount = response.data.map((item) => ({
                    ...item,
                    role: item.roleId === 1 ? 'Administrador' : item.roleId === 2 ? 'Supervisor' : 'Operador',
                    status: item.status ? 'activo' : 'inactivo',
                }))
                setUsers(dataCount)
            }
        } catch (err) {
            console.error('Error fetch:', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        setPage(1)
    }, [searchValue, statusFilter, rowsPerPage])

    const filteredAndSortedItems = useMemo(() => {
        let result = [...users]
        if (searchValue) {
            const lowerSearch = searchValue.toLowerCase()
            result = result.filter((user) => user.name.toLowerCase().includes(lowerSearch) || user.email.toLowerCase().includes(lowerSearch))
        }
        if (statusFilter && statusFilter !== 'all') {
            result = result.filter((user) => user.status === statusFilter)
        }
        if (sortOption?.value) {
            const key = sortOption.value
            const keyString = (user) => (user[key] || '').toString().toLowerCase()
            result.sort((a, b) => keyString(a).localeCompare(keyString(b)))
        }
        return result
    }, [users, searchValue, statusFilter, sortOption])

    const pages = Math.ceil(filteredAndSortedItems.length / Number(rowsPerPage))
    const paginatedItems = useMemo(() => {
        const start = (page - 1) * Number(rowsPerPage)
        return filteredAndSortedItems.slice(start, start + Number(rowsPerPage))
    }, [page, filteredAndSortedItems, rowsPerPage])

    return (
        <View style={{ flex: 1 }}>
            <ScrollableLayout onRefresh={fetchData}>
                <View className="p-[6%] min-h-full">
                    <View className="flex flex-col w-full justify-between shrink-0 gap-4 items-end">
                        <View className="w-full flex flex-row justify-between items-end">
                            <Text className="font-bold text-[32px] text-foreground">Usuarios</Text>
                            <View className="flex flex-row gap-2 items-center">
                                {/* Botón Filtros */}
                                <Button isIconOnly className="bg-transparent shrink-0" isDisabled={isLoading} onPress={openFilterModal}>
                                    <Ionicons name="filter-outline" size={24} color={colors.foreground} />
                                </Button>
                                {/* Botón Crear */}
                                <Button isIconOnly className="font-semibold shrink-0" variant="primary" isDisabled={isLoading} onPress={openCreateModal}>
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
                            {statusFilter !== 'all' && (
                                <View className="flex-row items-center bg-surface-1 px-2 py-2 rounded-lg gap-2">
                                    <Ionicons
                                        name={statusFilter === 'activo' ? 'person' : 'person-outline'}
                                        size={12}
                                        color={statusFilter === 'activo' ? colors.accent : colors.mutedForeground}
                                    />
                                    <Text className="text-xs font-semibold text-foreground capitalize">{statusFilter}</Text>
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
                            placeholder="Buscar..."
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
                        <View className="py-12 items-center">
                            <Spinner color={colors.foreground} size="md" />
                        </View>
                    ) : (
                        <ScrollShadow className="w-full" size={20} LinearGradientComponent={LinearGradient}>
                            <View className="p-0">
                                {paginatedItems.length > 0 ? (
                                    <>
                                        {/* AÑADIDO: Props value y onValueChange para controlar el estado del acordeón */}
                                        <Accordion
                                            selectionMode="single"
                                            className="border-0"
                                            isDividerVisible={false}
                                            value={expandedKeys}
                                            onValueChange={setExpandedKeys}
                                        >
                                            {paginatedItems.map((item) => (
                                                <Accordion.Item key={item.id} value={item.id} className="bg-accent-soft mb-2 rounded-lg overflow-hidden">
                                                    <Accordion.Trigger className="w-full bg-accent-soft pl-4 pr-0 py-4">
                                                        <View className="flex-row items-center justify-between w-full">
                                                            <View className="flex-1 gap-1 pr-2">
                                                                <View className="flex-row items-center gap-2">
                                                                    <Ionicons
                                                                        name={item.status === 'activo' ? 'person' : 'person-outline'}
                                                                        size={14}
                                                                        color={item.status === 'activo' ? colors.accent : colors.mutedForeground}
                                                                    />
                                                                    <Text className="text-foreground flex-shrink text-lg font-semibold" numberOfLines={1}>
                                                                        {item.name}
                                                                    </Text>
                                                                </View>
                                                                <Text className="text-muted-foreground text-[14px]" numberOfLines={1}>
                                                                    {item.email}
                                                                </Text>
                                                            </View>

                                                            <View className="flex flex-row items-center gap-2">
                                                                <TouchableOpacity
                                                                    onPress={() => openEditModal(item)}
                                                                    className="h-14 w-14 flex items-center justify-center"
                                                                    activeOpacity={0.7}
                                                                >
                                                                    <Ionicons name="create-outline" size={24} color={colors.foreground} />
                                                                </TouchableOpacity>

                                                                <Accordion.Indicator
                                                                    className="h-14 w-14 flex items-center justify-center"
                                                                    iconProps={{
                                                                        color: colors.accent,
                                                                        size: 24,
                                                                    }}
                                                                />
                                                            </View>
                                                        </View>
                                                    </Accordion.Trigger>

                                                    <Accordion.Content className="bg-accent-soft px-4 pb-4">
                                                        <View className="h-px bg-surface-3 mt-0 mb-4" />

                                                        <View className="gap-3">
                                                            <View className="gap-3">
                                                                <View className="flex-row items-start justify-between">
                                                                    <Text className="text-[14px] text-muted-foreground w-28 pt-0.5">Actualizado</Text>
                                                                    <Text className="text-[14px] text-foreground text-right flex-1" numberOfLines={2}>
                                                                        {formatDateLiteral(item.updatedAt, true)}
                                                                    </Text>
                                                                </View>

                                                                <View className="flex-row items-start justify-between">
                                                                    <Text className="text-[14px] text-muted-foreground w-28 pt-0.5">Puesto</Text>
                                                                    <Text
                                                                        className="text-[14px] text-foreground text-right flex-1 font-medium"
                                                                        numberOfLines={2}
                                                                    >
                                                                        {item.position}
                                                                    </Text>
                                                                </View>

                                                                <View className="flex-row items-start justify-between">
                                                                    <Text className="text-[14px] text-muted-foreground w-28 pt-0.5">Rol</Text>
                                                                    <Text className="text-[14px] text-foreground text-right flex-1" numberOfLines={2}>
                                                                        {item.role}
                                                                    </Text>
                                                                </View>

                                                                <View className="flex-row items-start justify-between">
                                                                    <Text className="text-[14px] text-muted-foreground w-28 pt-0.5">Teléfono</Text>
                                                                    <Text
                                                                        className={`text-[14px] text-right flex-1 ${item.phone ? 'text-foreground' : 'text-muted-foreground italic'}`}
                                                                        numberOfLines={2}
                                                                    >
                                                                        {item.phone || 'No especificado'}
                                                                    </Text>
                                                                </View>
                                                            </View>

                                                            <View className="flex-row items-center justify-between">
                                                                <Text className="text-[14px] text-muted-foreground">Estado</Text>
                                                                <TouchableOpacity onPress={() => openStatusModal(item)} activeOpacity={0.8}>
                                                                    <View pointerEvents="none">
                                                                        <Switch
                                                                            isSelected={item.status === 'activo'}
                                                                            colors={{
                                                                                defaultBackground: colors.surface3,
                                                                                selectedBackground: colors.accent,
                                                                                defaultBorder: 'transparent',
                                                                                selectedBorder: 'transparent',
                                                                            }}
                                                                        >
                                                                            <Switch.Thumb
                                                                                colors={{
                                                                                    defaultBackground: colors.background,
                                                                                    selectedBackground: colors.accentForeground,
                                                                                }}
                                                                            />
                                                                        </Switch>
                                                                    </View>
                                                                </TouchableOpacity>
                                                            </View>
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
                                    <Text className="text-center mt-4 text-muted-foreground">No se encontraron usuarios.</Text>
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
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                rowsPerPage={rowsPerPage}
                setRowsPerPage={setRowsPerPage}
                setPage={setPage}
            />

            <CreateUserModalContent modalRef={createModalRef} onUserCreated={fetchData} isLoading={isLoading} />

            <EditUserModalContent modalRef={editModalRef} user={userToEdit} onUserUpdated={fetchData} />

            <StatusChangeModalContent modalRef={statusModalRef} user={userToChangeStatus} onStatusChanged={fetchData} />
        </View>
    )
}
export default UsersScreen
