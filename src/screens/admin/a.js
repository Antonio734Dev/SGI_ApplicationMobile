import React, { startTransition, useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import ScrollableLayout from '../../layouts/ScrollableLayout'
import { Button, ScrollShadow, useTheme } from 'heroui-native'
import { getUsersRequest } from '../../services/user'
import { Ionicons } from '@expo/vector-icons'
import { ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

const UsersScreen = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [errors, setErrors] = useState([])
    const { colors } = useTheme()

    const fetchData = async () => {
        try {
            setIsLoading(true)

            const response = await getUsersRequest()
            console.log('Respuesta de usuarios:', response)
            const data = response.data

            if (data) {
                const dataCount = data.map((item, index) => ({
                    ...item,
                    n: index + 1,
                    role: item.roleId === 1 ? 'Admin' : 'User',
                    status: item.status ? 'activo' : 'inactivo',
                }))

                console.log('Usuarios obtenidos:', dataCount)
                setUsers(dataCount)

                setSelectedUser((prev) => {
                    if (!prev) return null
                    const updated = dataCount.find((u) => u.id === prev.id)
                    return updated ?? prev
                })
            } else {
                console.error('No se pudieron obtener los datos')
                setErrors((prev) => [...prev, 'No se pudieron obtener los datos'])
            }
        } catch (err) {
            setErrors((prev) => [...prev, err.message])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    /*    const renderUserAccordion = useCallback((user, index) => {
        return (
            <AccordionItem
                className="rounded-small"
                key={index}
                aria-label={user.name}
                classNames={{ trigger: 'gap-0', content: 'pb-4 pt-0' }}
                indicator={<IoChevronBack className="size-5 text-foreground" />}
                title={
                    <div className="flex justify-between w-full h-full gap-2">
                        <div className="flex flex-col w-full">
                            <p className="line-clamp-2 max-[360px]:break-all">{user.name}</p>
                            <p className="text-[14px] dark:text-neutral-300 text-neutral-700 break-all line-clamp-1">{user.email}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button className="bg-transparent shrink-0" size="lg" radius="sm" isIconOnly as="a">
                                <IoEllipsisVertical className="size-5" />
                            </Button>
                        </div>
                    </div>
                }
            >
                <div className="flex justify-between">
                    <div className="flex flex-col gap-0 shrink-0 justify-center">
                        <div className="flex items-center gap-2">
                            <p className="text-[14px] dark:text-neutral-300 text-neutral-700">Rol:</p>
                            <p>{user.roleName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-[14px] dark:text-neutral-300 text-neutral-700">Teléfono:</p>
                            <p>{user.phoneNumber || '-'}</p>
                        </div>
                    </div>
                    <div className="flex items-end gap-4">
                        <Switch
                            color="primary"
                            size="lg"
                            isSelected={user.status}
                            classNames={{
                                thumb: 'bg-background',
                            }}
                        />
                    </div>
                </div>
            </AccordionItem>
        )
    }, [])
*/
    return (
        <ScrollableLayout onRefresh={fetchData}>
            <View className="px-[6%] py-[4%]">
                <View className="flex flex-col w-full justify-between px-4 shrink-0 gap-4">
                    <View className="w-full flex flex-row justify-between items-center">
                        <Text className="font-bold text-[32px] max-[360px]:text-xl text-foreground">Usuarios</Text>

                        <View className="flex flex-row gap-4">
                            <View className="flex-row shrink-0">
                                <Button isIconOnly className="font-semibold">
                                    <Ionicons name="filter" size={24} color={colors.accentForeground} />
                                </Button>

                                <Button isIconOnly className="font-semibold">
                                    <Ionicons name="funnel" size={24} color={colors.accentForeground} />
                                </Button>
                            </View>

                            <Button isIconOnly className="font-semibold shrink-0" variant="primary" size="lg">
                                <Ionicons name="add-circle" size={24} />
                            </Button>
                        </View>
                    </View>
                </View>

                <ScrollShadow className="flex-1 bg-transparent px-2 pt-2 mt-2" size={20} LinearGradientComponent={LinearGradient}>
                    <View>
                        {users.length > 0 ? (
                            <View className="flex flex-col gap-3">
                                {users.map((user, index) => (
                                    <View key={user.id || index} className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                                        <Text className="text-foreground text-lg font-medium">{user.name}</Text>
                                        {/* Opcional: mostrar el email para verificar datos */}
                                        <Text className="text-neutral-500 text-sm">{user.email}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text className="dark:text-neutral-300 text-neutral-700 text-center">No se encontraron usuarios.</Text>
                        )}
                    </View>
                    {/*
                    {users.length > 0 ? (
                        <Accordion>{users.map((user, index) => renderUserAccordion(user, (page - 1) * rowsPerPage + index))}</Accordion>
                    ) : (
                        <Text className="dark:text-neutral-300 text-neutral-700 text-center">No se encontraron usuarios.</Text>
                    )}
                    {totalPages > 0 && (
                        <View className="flex w-full justify-end items-center shrink-0 pt-4">
                            <Text className="dark:text-neutral-300 text-neutral-700">Paginación</Text>
                            <Pagination
                                isCompact
                                showControls
                                showShadow
                                color="primary"
                                page={page}
                                total={totalPages}
                                onChange={(page) => setPage(page)}
                                aria-label="Pagination"
                                radius="sm"
                                size="lg"
                                variant="light"
                                className="m-0 px-0 pt-2 pb-2.5 n4"
                                classNames={{ cursor: 'font-medium', wrapper: 'gap-0 sm:gap-1' }}
                            />
                        </View>
                    )} 
                     */}
                </ScrollShadow>
            </View>
        </ScrollableLayout>
    )
}

export default UsersScreen
