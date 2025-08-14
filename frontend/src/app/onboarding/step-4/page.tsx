"use client";

import { Organization } from "@/types/organization";
import ActionFooter from "../ActionFooter";
import SelectableList from "../SelectableList";
import { useEffect, useState } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import {
    usePullRequestAnalysisQuery,
    useReviewPullRequestQuery,
} from "@/api/queries/pullRequest";
import PrCodeAnalysis from "./PrCodeAnalysis";
import Image from "next/image";
import { formatDate } from "@/lib/dayjs";
import { PRAnalysisData } from "@/types/prAnalysis";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = {
    pullRequest: {
        provider: "github",
        prId: "2316699524",
        prUser: "sroy-dev",
        owner: "sroy-dev",
        repo: "team-sync",
        prNumber: "9",
        installationId: "79753780",
        prRepoName: "sroy-dev/team-sync",
        prTitle: "a",
        prBody: "",
        prState: "closed",
        prCreatedAt: "2025-02-05T05:18:42Z",
        prUpdatedAt: "2025-02-05T05:18:50Z",
        prHeadBranch: "santu-dev",
        prBaseBranch: "sabbir-dev",
        prHeadSha: "be3a0369592da21382d764d63aea1ef65bdcf6c9",
        prBaseSha: "764a6942829ddc58a9febccc05b6a1d579662d0f",
        prFilesChanged: 5,
        prFiles: [
            {
                prFileName:
                    "resources/js/app-main/layout/side-bar/ChannelAddDialog.tsx",
                prFileStatus: "modified",
                prFileAdditions: 0,
                prFileDeletions: 2,
                prFileChanges: 2,
                prFileContentBefore:
                    "import { Button } from '@/components/ui/button'\nimport {\n    Dialog,\n    DialogContent,\n    DialogDescription,\n    DialogHeader,\n    DialogTitle,\n    DialogTrigger,\n} from '@/components/ui/dialog'\nimport { Form } from '@/components/ui/form'\nimport { Input } from '@/components/ui/input'\nimport { RadioGroup } from '@/components/ui/radio-group'\nimport { Textarea } from '@/components/ui/textarea'\nimport { useCreateChannelMutation } from '@/store/apis/channelApi'\nimport { zodResolver } from '@hookform/resolvers/zod'\nimport { FC, ReactNode } from 'react'\nimport { useForm } from 'react-hook-form'\nimport { z } from 'zod'\n\nconst defaultValues = {\n    name: '',\n    description: '',\n    channel_type: 'public',\n}\n\nconst FormSchema = z.object({\n    name: z.string().min(1),\n    description: z.string().optional(),\n    channel_type: z.string(),\n})\n\ninterface ChannelAddDialogProps {\n    children: ReactNode\n}\n\nconst ChannelAddDialog: FC<ChannelAddDialogProps> = ({ children }) => {\n    const [createChannel, { isLoading }] = useCreateChannelMutation()\n\n    const form = useForm<z.infer<typeof FormSchema>>({\n        resolver: zodResolver(FormSchema),\n        defaultValues,\n    })\n\n    const onSubmit = (data: z.infer<typeof FormSchema>) => {\n        console.log(data)\n        return\n        createChannel(data)\n            .unwrap()\n            .then(() => {\n                // toast({\n                //     message: 'Channel created successfully',\n                //     type: 'success',\n                // })\n            })\n            .catch((error: any) => {})\n    }\n\n    return (\n        <Dialog>\n            <DialogTrigger asChild>{children}</DialogTrigger>\n            <DialogContent className='sm:max-w-[425px]'>\n                <DialogHeader>\n                    <DialogTitle>Create New Channel</DialogTitle>\n                    <DialogDescription>\n                        Channels are where your team communicates. They're best when organized\n                        around a topic — #marketing, for example.\n                    </DialogDescription>\n                </DialogHeader>\n                <Form {...form}>\n                    <form onSubmit={form.handleSubmit(onSubmit)} className=''>\n                        <Input\n                            control={form.control}\n                            name='name'\n                            label='Name'\n                            placeholder='e.g. marketing'\n                        />\n                        <Textarea control={form.control} name='description' label='Description' />\n                        <RadioGroup\n                            options={[\n                                { value: 'public', label: 'Public' },\n                                { value: 'private', label: 'Private' },\n                            ]}\n                            control={form.control}\n                            name='channel_type'\n                            label='Channel Type'\n                        />\n                        <div className='text-right'>\n                            <Button type='submit' className='' loading={isLoading}>\n                                Create Channel\n                            </Button>\n                        </div>\n                    </form>\n                </Form>\n            </DialogContent>\n        </Dialog>\n    )\n}\n\nexport default ChannelAddDialog\n",
                prFileContentAfter:
                    "import { Button } from '@/components/ui/button'\nimport {\n    Dialog,\n    DialogContent,\n    DialogDescription,\n    DialogHeader,\n    DialogTitle,\n    DialogTrigger,\n} from '@/components/ui/dialog'\nimport { Form } from '@/components/ui/form'\nimport { Input } from '@/components/ui/input'\nimport { RadioGroup } from '@/components/ui/radio-group'\nimport { Textarea } from '@/components/ui/textarea'\nimport { useCreateChannelMutation } from '@/store/apis/channelApi'\nimport { zodResolver } from '@hookform/resolvers/zod'\nimport { FC, ReactNode } from 'react'\nimport { useForm } from 'react-hook-form'\nimport { z } from 'zod'\n\nconst defaultValues = {\n    name: '',\n    description: '',\n    channel_type: 'public',\n}\n\nconst FormSchema = z.object({\n    name: z.string().min(1),\n    description: z.string().optional(),\n    channel_type: z.string(),\n})\n\ninterface ChannelAddDialogProps {\n    children: ReactNode\n}\n\nconst ChannelAddDialog: FC<ChannelAddDialogProps> = ({ children }) => {\n    const [createChannel, { isLoading }] = useCreateChannelMutation()\n\n    const form = useForm<z.infer<typeof FormSchema>>({\n        resolver: zodResolver(FormSchema),\n        defaultValues,\n    })\n\n    const onSubmit = (data: z.infer<typeof FormSchema>) => {\n        createChannel(data)\n            .unwrap()\n            .then(() => {\n                // toast({\n                //     message: 'Channel created successfully',\n                //     type: 'success',\n                // })\n            })\n            .catch((error: any) => {})\n    }\n\n    return (\n        <Dialog>\n            <DialogTrigger asChild>{children}</DialogTrigger>\n            <DialogContent className='sm:max-w-[425px]'>\n                <DialogHeader>\n                    <DialogTitle>Create New Channel</DialogTitle>\n                    <DialogDescription>\n                        Channels are where your team communicates. They're best when organized\n                        around a topic — #marketing, for example.\n                    </DialogDescription>\n                </DialogHeader>\n                <Form {...form}>\n                    <form onSubmit={form.handleSubmit(onSubmit)} className=''>\n                        <Input\n                            control={form.control}\n                            name='name'\n                            label='Name'\n                            placeholder='e.g. marketing'\n                        />\n                        <Textarea control={form.control} name='description' label='Description' />\n                        <RadioGroup\n                            options={[\n                                { value: 'public', label: 'Public' },\n                                { value: 'private', label: 'Private' },\n                            ]}\n                            control={form.control}\n                            name='channel_type'\n                            label='Channel Type'\n                        />\n                        <div className='text-right'>\n                            <Button type='submit' className='' loading={isLoading}>\n                                Create Channel\n                            </Button>\n                        </div>\n                    </form>\n                </Form>\n            </DialogContent>\n        </Dialog>\n    )\n}\n\nexport default ChannelAddDialog\n",
                prFileDiff:
                    "@@ -42,8 +42,6 @@ const ChannelAddDialog: FC<ChannelAddDialogProps> = ({ children }) => {\n     })\n \n     const onSubmit = (data: z.infer<typeof FormSchema>) => {\n-        console.log(data)\n-        return\n         createChannel(data)\n             .unwrap()\n             .then(() => {",
                prFileDiffHunks: [
                    "@@ -42,8 +42,6 @@ const ChannelAddDialog: FC<ChannelAddDialogProps> = ({ children }) => {\n     })\n \n     const onSubmit = (data: z.infer<typeof FormSchema>) => {\n-        console.log(data)\n-        return\n         createChannel(data)\n             .unwrap()\n             .then(() => {",
                ],
                prFileBlobUrl:
                    "https://github.com/sroy-dev/team-sync/blob/be3a0369592da21382d764d63aea1ef65bdcf6c9/resources%2Fjs%2Fapp-main%2Flayout%2Fside-bar%2FChannelAddDialog.tsx",
            },
            {
                prFileName:
                    "resources/js/app-main/layout/side-bar/ChannelList.tsx",
                prFileStatus: "modified",
                prFileAdditions: 0,
                prFileDeletions: 2,
                prFileChanges: 2,
                prFileContentBefore:
                    "import { useLazyGetChannelsQuery } from '@/store/apis/channelApi'\nimport { Plus } from 'lucide-react'\nimport { FC, useEffect } from 'react'\nimport { useNavigate } from 'react-router-dom'\nimport ChannelAddDialog from './ChannelAddDialog'\n\ninterface ChannelListProps {\n    className?: string\n}\n\nconst ChannelList: FC<ChannelListProps> = ({ className }) => {\n    const [getChannels, { data: channels, isLoading }] = useLazyGetChannelsQuery()\n    const navigate = useNavigate()\n\n    const handleChannelClick = (channelId: string) => {\n        navigate(`/channel/${channelId}`)\n    }\n\n    useEffect(() => {\n        getChannels()\n    }, [])\n\n    console.log(channels)\n\n    return (\n        <div className='mb-7'>\n            <div className='flex justify-between px-4 mb-3'>\n                <div className='text-sm font-semibold text-slate-600'>Channels</div>\n\n                <ChannelAddDialog>\n                    <button onClick={() => {}}>\n                        <Plus className='h-4' />\n                    </button>\n                </ChannelAddDialog>\n            </div>\n            {\n                // channels\n                channels?.data?.channel?.map((channel: any, i: number) => (\n                    <div\n                        key={i}\n                        className='flex justify-between px-4 py-2 hover:bg-slate-700/10 text-slate-400 cursor-pointer'\n                        onClick={() => handleChannelClick(channel.id)}\n                    >\n                        <div className='text-sm'># {channel.name}</div>\n                        {/* <div className='text-xs text-slate-400'>(10)</div> */}\n                    </div>\n                ))\n            }\n        </div>\n    )\n}\n\nexport default ChannelList\n",
                prFileContentAfter:
                    "import { useLazyGetChannelsQuery } from '@/store/apis/channelApi'\nimport { Plus } from 'lucide-react'\nimport { FC, useEffect } from 'react'\nimport { useNavigate } from 'react-router-dom'\nimport ChannelAddDialog from './ChannelAddDialog'\n\ninterface ChannelListProps {\n    className?: string\n}\n\nconst ChannelList: FC<ChannelListProps> = ({ className }) => {\n    const [getChannels, { data: channels, isLoading }] = useLazyGetChannelsQuery()\n    const navigate = useNavigate()\n\n    const handleChannelClick = (channelId: string) => {\n        navigate(`/channel/${channelId}`)\n    }\n\n    useEffect(() => {\n        getChannels()\n    }, [])\n\n    return (\n        <div className='mb-7'>\n            <div className='flex justify-between px-4 mb-3'>\n                <div className='text-sm font-semibold text-slate-600'>Channels</div>\n\n                <ChannelAddDialog>\n                    <button onClick={() => {}}>\n                        <Plus className='h-4' />\n                    </button>\n                </ChannelAddDialog>\n            </div>\n            {\n                // channels\n                channels?.data?.channel?.map((channel: any, i: number) => (\n                    <div\n                        key={i}\n                        className='flex justify-between px-4 py-2 hover:bg-slate-700/10 text-slate-400 cursor-pointer'\n                        onClick={() => handleChannelClick(channel.id)}\n                    >\n                        <div className='text-sm'># {channel.name}</div>\n                        {/* <div className='text-xs text-slate-400'>(10)</div> */}\n                    </div>\n                ))\n            }\n        </div>\n    )\n}\n\nexport default ChannelList\n",
                prFileDiff:
                    "@@ -20,8 +20,6 @@ const ChannelList: FC<ChannelListProps> = ({ className }) => {\n         getChannels()\n     }, [])\n \n-    console.log(channels)\n-\n     return (\n         <div className='mb-7'>\n             <div className='flex justify-between px-4 mb-3'>",
                prFileDiffHunks: [
                    "@@ -20,8 +20,6 @@ const ChannelList: FC<ChannelListProps> = ({ className }) => {\n         getChannels()\n     }, [])\n \n-    console.log(channels)\n-\n     return (\n         <div className='mb-7'>\n             <div className='flex justify-between px-4 mb-3'>",
                ],
                prFileBlobUrl:
                    "https://github.com/sroy-dev/team-sync/blob/be3a0369592da21382d764d63aea1ef65bdcf6c9/resources%2Fjs%2Fapp-main%2Flayout%2Fside-bar%2FChannelList.tsx",
            },
            {
                prFileName:
                    "resources/js/app-main/message/page/ChannelMessages.tsx",
                prFileStatus: "modified",
                prFileAdditions: 0,
                prFileDeletions: 2,
                prFileChanges: 2,
                prFileContentBefore:
                    "import { BaseState } from '@/store'\nimport {\n    useLazyGetChannelMessagesQuery,\n    useLazyGetNewChannelMessagesQuery,\n    useSendChannelMessageMutation,\n} from '@/store/apis/channelApi'\nimport { FC, useCallback, useEffect, useState } from 'react'\nimport { useSelector } from 'react-redux'\nimport { useParams } from 'react-router-dom'\nimport ChannelBar from '../components/ChannelBar'\nimport MessageInput from '../components/MessageInput'\nimport SingleMessage from '../components/SingleMessage'\n\nconst ChannelMessages: FC = () => {\n    const [page, setPage] = useState(1)\n    const [messages, setMessages] = useState<any>({})\n    const { channels } = useSelector((state: BaseState) => state.auth)\n    const { channelId } = useParams()\n\n    const [sendMessage] = useSendChannelMessageMutation()\n    const [getMessages] = useLazyGetChannelMessagesQuery()\n    const [getNewMessages] = useLazyGetNewChannelMessagesQuery()\n\n    // const channel = channels.find((member: any) => member.id === Number(channelId))\n    // if (!channel) return <Navigate to={ErrorRoutesEnum.NOT_FOUND} />\n\n    const handleSendMessage = async (message: string) => {\n        sendMessage({ body: { message: message, channel_id: channelId } })\n            .unwrap()\n            .then((data) => {\n                setMessages([data.data, ...messages])\n            })\n    }\n\n    const fetchMessages = () => {\n        getMessages(channelId)\n            .unwrap()\n            .then((data) => {\n                console.log('Messages fetched', data)\n                setMessages(data.data.messages)\n            })\n            .catch((error) => {\n                if (error.status === 404) {\n                    console.log('No messages found')\n                    setMessages({})\n                }\n            })\n    }\n\n    useEffect(() => {\n        fetchMessages()\n    }, [channelId])\n\n    const fetchNewMessages = useCallback(() => {\n        if (!messages.length) return\n        console.log('Fetching new messages')\n        getNewMessages({ id: channelId, last_message_id: messages[0]?.id })\n            .unwrap()\n            .then((data) => {\n                console.log('New Messages fetched', data)\n                setMessages([...data.data, ...messages])\n            })\n    }, [messages, channelId])\n\n    useEffect(() => {\n        const interval = setInterval(() => {\n            // fetchNewMessages()\n        }, 3000)\n\n        return () => {\n            clearInterval(interval)\n        }\n    }, [fetchNewMessages])\n\n    return (\n        <div className='h-screen flex flex-col'>\n            <ChannelBar />\n            <div className='h-[calc(100vh-124px)] grow overflow-y-auto scrollbar flex flex-col-reverse'>\n                {Object.keys(messages).map((key: any) => (\n                    <>\n                        {messages[key].map((message: any) => (\n                            <SingleMessage key={message.id} message={message} />\n                        ))}\n                    </>\n                ))}\n                {/* {messages.map((message: any) => (\n                    <SingleMessage key={message.id} message={message} />\n                ))} */}\n            </div>\n            <MessageInput onEnter={handleSendMessage} />\n        </div>\n    )\n}\n\nexport default ChannelMessages\n",
                prFileContentAfter:
                    "import { BaseState } from '@/store'\nimport {\n    useLazyGetChannelMessagesQuery,\n    useLazyGetNewChannelMessagesQuery,\n    useSendChannelMessageMutation,\n} from '@/store/apis/channelApi'\nimport { FC, useCallback, useEffect, useState } from 'react'\nimport { useSelector } from 'react-redux'\nimport { useParams } from 'react-router-dom'\nimport ChannelBar from '../components/ChannelBar'\nimport MessageInput from '../components/MessageInput'\nimport SingleMessage from '../components/SingleMessage'\n\nconst ChannelMessages: FC = () => {\n    const [page, setPage] = useState(1)\n    const [messages, setMessages] = useState<any>({})\n    const { channels } = useSelector((state: BaseState) => state.auth)\n    const { channelId } = useParams()\n\n    const [sendMessage] = useSendChannelMessageMutation()\n    const [getMessages] = useLazyGetChannelMessagesQuery()\n    const [getNewMessages] = useLazyGetNewChannelMessagesQuery()\n\n    // const channel = channels.find((member: any) => member.id === Number(channelId))\n    // if (!channel) return <Navigate to={ErrorRoutesEnum.NOT_FOUND} />\n\n    const handleSendMessage = async (message: string) => {\n        sendMessage({ body: { message: message, channel_id: channelId } })\n            .unwrap()\n            .then((data) => {\n                setMessages([data.data, ...messages])\n            })\n    }\n\n    const fetchMessages = () => {\n        getMessages(channelId)\n            .unwrap()\n            .then((data) => {\n                setMessages(data.data.messages)\n            })\n            .catch((error) => {\n                if (error.status === 404) {\n                    setMessages({})\n                }\n            })\n    }\n\n    useEffect(() => {\n        fetchMessages()\n    }, [channelId])\n\n    const fetchNewMessages = useCallback(() => {\n        if (!messages.length) return\n        console.log('Fetching new messages')\n        getNewMessages({ id: channelId, last_message_id: messages[0]?.id })\n            .unwrap()\n            .then((data) => {\n                console.log('New Messages fetched', data)\n                setMessages([...data.data, ...messages])\n            })\n    }, [messages, channelId])\n\n    useEffect(() => {\n        const interval = setInterval(() => {\n            // fetchNewMessages()\n        }, 3000)\n\n        return () => {\n            clearInterval(interval)\n        }\n    }, [fetchNewMessages])\n\n    return (\n        <div className='h-screen flex flex-col'>\n            <ChannelBar />\n            <div className='h-[calc(100vh-124px)] grow overflow-y-auto scrollbar flex flex-col-reverse'>\n                {Object.keys(messages).map((key: any) => (\n                    <>\n                        {messages[key].map((message: any) => (\n                            <SingleMessage key={message.id} message={message} />\n                        ))}\n                    </>\n                ))}\n                {/* {messages.map((message: any) => (\n                    <SingleMessage key={message.id} message={message} />\n                ))} */}\n            </div>\n            <MessageInput onEnter={handleSendMessage} />\n        </div>\n    )\n}\n\nexport default ChannelMessages\n",
                prFileDiff:
                    "@@ -36,12 +36,10 @@ const ChannelMessages: FC = () => {\n         getMessages(channelId)\n             .unwrap()\n             .then((data) => {\n-                console.log('Messages fetched', data)\n                 setMessages(data.data.messages)\n             })\n             .catch((error) => {\n                 if (error.status === 404) {\n-                    console.log('No messages found')\n                     setMessages({})\n                 }\n             })",
                prFileDiffHunks: [
                    "@@ -36,12 +36,10 @@ const ChannelMessages: FC = () => {\n         getMessages(channelId)\n             .unwrap()\n             .then((data) => {\n-                console.log('Messages fetched', data)\n                 setMessages(data.data.messages)\n             })\n             .catch((error) => {\n                 if (error.status === 404) {\n-                    console.log('No messages found')\n                     setMessages({})\n                 }\n             })",
                ],
                prFileBlobUrl:
                    "https://github.com/sroy-dev/team-sync/blob/be3a0369592da21382d764d63aea1ef65bdcf6c9/resources%2Fjs%2Fapp-main%2Fmessage%2Fpage%2FChannelMessages.tsx",
            },
            {
                prFileName: "resources/js/store/apis/channelApi.ts",
                prFileStatus: "modified",
                prFileAdditions: 1,
                prFileDeletions: 1,
                prFileChanges: 2,
                prFileContentBefore:
                    "import { Response } from '@/types/response'\nimport { baseApi } from '.'\nimport { addChannel, setChannels } from '../slices/authSlice'\n\nconst channelApi = baseApi.enhanceEndpoints({ addTagTypes: ['Channel'] }).injectEndpoints({\n    endpoints: (builder) => ({\n        getChannels: builder.query<Response<any>, void>({\n            query: () => '/app/channels',\n            providesTags: ['Channel'],\n            onQueryStarted: async (_, { dispatch, queryFulfilled }) => {\n                queryFulfilled.then(({ data }) => {\n                    dispatch(setChannels(data.data))\n                })\n            },\n        }),\n        createChannel: builder.mutation({\n            query: (channel) => ({\n                url: '/app/channels',\n                method: 'POST',\n                body: channel,\n            }),\n            invalidatesTags: ['Channel'],\n            onQueryStarted: async (_, { dispatch, queryFulfilled }) => {\n                queryFulfilled.then(({ data }) => {\n                    dispatch(addChannel(data.data))\n                })\n            },\n        }),\n        getChannelMessages: builder.query({\n            query: (channelId) => `/app/channel-messages/${channelId}`,\n            providesTags: ['Channel'],\n        }),\n        sendChannelMessage: builder.mutation({\n            query: ({ body }) => ({\n                url: `/app/channel-messages`,\n                method: 'POST',\n                body,\n            }),\n            invalidatesTags: ['Channel'],\n        }),\n        getNewChannelMessages: builder.query({\n            query: ({ id, last_message_id }) =>\n                `/app/channel-messages/${id}/new?last_message_id=${last_message_id}`,\n            providesTags: ['Channel'],\n        }),\n    }),\n})\n\nexport const {\n    useLazyGetChannelsQuery,\n    useCreateChannelMutation,\n    useLazyGetChannelMessagesQuery,\n    useSendChannelMessageMutation,\n    useLazyGetNewChannelMessagesQuery,\n} = channelApi\n",
                prFileContentAfter:
                    "import { Response } from '@/types/response'\nimport { baseApi } from '.'\nimport { addChannel, setChannels } from '../slices/authSlice'\n\nconst channelApi = baseApi.enhanceEndpoints({ addTagTypes: ['Channel'] }).injectEndpoints({\n    endpoints: (builder) => ({\n        getChannels: builder.query<Response<any>, void>({\n            query: () => '/app/channels',\n            providesTags: ['Channel'],\n            onQueryStarted: async (_, { dispatch, queryFulfilled }) => {\n                queryFulfilled.then(({ data }) => {\n                    dispatch(setChannels(data.data?.channel))\n                })\n            },\n        }),\n        createChannel: builder.mutation({\n            query: (channel) => ({\n                url: '/app/channels',\n                method: 'POST',\n                body: channel,\n            }),\n            invalidatesTags: ['Channel'],\n            onQueryStarted: async (_, { dispatch, queryFulfilled }) => {\n                queryFulfilled.then(({ data }) => {\n                    dispatch(addChannel(data.data))\n                })\n            },\n        }),\n        getChannelMessages: builder.query({\n            query: (channelId) => `/app/channel-messages/${channelId}`,\n            providesTags: ['Channel'],\n        }),\n        sendChannelMessage: builder.mutation({\n            query: ({ body }) => ({\n                url: `/app/channel-messages`,\n                method: 'POST',\n                body,\n            }),\n            invalidatesTags: ['Channel'],\n        }),\n        getNewChannelMessages: builder.query({\n            query: ({ id, last_message_id }) =>\n                `/app/channel-messages/${id}/new?last_message_id=${last_message_id}`,\n            providesTags: ['Channel'],\n        }),\n    }),\n})\n\nexport const {\n    useLazyGetChannelsQuery,\n    useCreateChannelMutation,\n    useLazyGetChannelMessagesQuery,\n    useSendChannelMessageMutation,\n    useLazyGetNewChannelMessagesQuery,\n} = channelApi\n",
                prFileDiff:
                    "@@ -9,7 +9,7 @@ const channelApi = baseApi.enhanceEndpoints({ addTagTypes: ['Channel'] }).inject\n             providesTags: ['Channel'],\n             onQueryStarted: async (_, { dispatch, queryFulfilled }) => {\n                 queryFulfilled.then(({ data }) => {\n-                    dispatch(setChannels(data.data))\n+                    dispatch(setChannels(data.data?.channel))\n                 })\n             },\n         }),",
                prFileDiffHunks: [
                    "@@ -9,7 +9,7 @@ const channelApi = baseApi.enhanceEndpoints({ addTagTypes: ['Channel'] }).inject\n             providesTags: ['Channel'],\n             onQueryStarted: async (_, { dispatch, queryFulfilled }) => {\n                 queryFulfilled.then(({ data }) => {\n-                    dispatch(setChannels(data.data))\n+                    dispatch(setChannels(data.data?.channel))\n                 })\n             },\n         }),",
                ],
                prFileBlobUrl:
                    "https://github.com/sroy-dev/team-sync/blob/be3a0369592da21382d764d63aea1ef65bdcf6c9/resources%2Fjs%2Fstore%2Fapis%2FchannelApi.ts",
            },
            {
                prFileName: "resources/js/store/slices/authSlice.ts",
                prFileStatus: "modified",
                prFileAdditions: 1,
                prFileDeletions: 1,
                prFileChanges: 2,
                prFileContentBefore:
                    "import { AuthEnum } from '@/enums/authEnums'\nimport { createSlice } from '@reduxjs/toolkit'\n\nconst initialState: any = {\n    user: null,\n    workspaces: [],\n    channels: [],\n    members: [],\n    selectedWorkspace: null,\n    token: null,\n}\n\nconst authSlice = createSlice({\n    name: 'auth',\n    initialState,\n    reducers: {\n        setUser: (state, action) => {\n            state.user = action.payload.user\n            state.workspaces = action.payload.workspaces\n            state.selectedWorkspace = action.payload.workspaces[0]\n            localStorage.setItem(\n                AuthEnum.LOCAL_STORAGE_SELECTED_WORKSPACE_ID,\n                action.payload.workspaces[0].id\n            )\n        },\n        setToken: (state, action) => {\n            state.token = action.payload\n            localStorage.setItem(AuthEnum.LOCAL_STORAGE_TOKEN_KEY, action.payload)\n        },\n        removeToken: (state) => {\n            state.token = null\n            localStorage.removeItem(AuthEnum.LOCAL_STORAGE_TOKEN_KEY)\n        },\n        removeUser: (state) => {\n            state.user = null\n            state.workspaces = []\n            state.selectedWorkspace = null\n            localStorage.removeItem(AuthEnum.LOCAL_STORAGE_SELECTED_WORKSPACE_ID)\n        },\n        addMember: (state, action) => {\n            state.members.unshift(action.payload)\n        },\n        setChannels: (state, action) => {\n            state.channels = action.payload\n        },\n        addChannel: (state, action) => {\n            state.channels.unshift(action.payload)\n        },\n    },\n})\n\nexport const { setUser, setToken, removeToken, removeUser, addMember, setChannels, addChannel } =\n    authSlice.actions\nexport default authSlice.reducer\n",
                prFileContentAfter:
                    "import { AuthEnum } from '@/enums/authEnums'\nimport { createSlice } from '@reduxjs/toolkit'\n\nconst initialState: any = {\n    user: null,\n    workspaces: [],\n    selectedWorkspace: null,\n    channels: [],\n    members: [],\n    token: null,\n}\n\nconst authSlice = createSlice({\n    name: 'auth',\n    initialState,\n    reducers: {\n        setUser: (state, action) => {\n            state.user = action.payload.user\n            state.workspaces = action.payload.workspaces\n            state.selectedWorkspace = action.payload.workspaces[0]\n            localStorage.setItem(\n                AuthEnum.LOCAL_STORAGE_SELECTED_WORKSPACE_ID,\n                action.payload.workspaces[0].id\n            )\n        },\n        setToken: (state, action) => {\n            state.token = action.payload\n            localStorage.setItem(AuthEnum.LOCAL_STORAGE_TOKEN_KEY, action.payload)\n        },\n        removeToken: (state) => {\n            state.token = null\n            localStorage.removeItem(AuthEnum.LOCAL_STORAGE_TOKEN_KEY)\n        },\n        removeUser: (state) => {\n            state.user = null\n            state.workspaces = []\n            state.selectedWorkspace = null\n            localStorage.removeItem(AuthEnum.LOCAL_STORAGE_SELECTED_WORKSPACE_ID)\n        },\n        addMember: (state, action) => {\n            state.members.unshift(action.payload)\n        },\n        setChannels: (state, action) => {\n            state.channels = action.payload\n        },\n        addChannel: (state, action) => {\n            state.channels.unshift(action.payload)\n        },\n    },\n})\n\nexport const { setUser, setToken, removeToken, removeUser, addMember, setChannels, addChannel } =\n    authSlice.actions\nexport default authSlice.reducer\n",
                prFileDiff:
                    "@@ -4,9 +4,9 @@ import { createSlice } from '@reduxjs/toolkit'\n const initialState: any = {\n     user: null,\n     workspaces: [],\n+    selectedWorkspace: null,\n     channels: [],\n     members: [],\n-    selectedWorkspace: null,\n     token: null,\n }\n ",
                prFileDiffHunks: [
                    "@@ -4,9 +4,9 @@ import { createSlice } from '@reduxjs/toolkit'\n const initialState: any = {\n     user: null,\n     workspaces: [],\n+    selectedWorkspace: null,\n     channels: [],\n     members: [],\n-    selectedWorkspace: null,\n     token: null,\n }\n ",
                ],
                prFileBlobUrl:
                    "https://github.com/sroy-dev/team-sync/blob/be3a0369592da21382d764d63aea1ef65bdcf6c9/resources%2Fjs%2Fstore%2Fslices%2FauthSlice.ts",
            },
        ],
    },
    owner: "sroy-dev",
    repo: "team-sync",
    prNumber: "9",
    provider: "github",
    installationId: 79753780,
    analysis: {
        summary:
            "**Summary**: This PR performs code cleanup by removing debug console.log statements from multiple React components and API handlers. The main functional change is a bug fix in the channel API where `data.data` was corrected to `data.data?.channel` to properly extract channel data from the API response. Additionally, the code reorganizes the initial state structure in the auth slice by moving `selectedWorkspace` above `channels` for better organization. The changes primarily focus on cleaning up development artifacts while fixing a potential data extraction issue in the channel management functionality.",
        comments: [
            {
                path: "resources/js/app-main/layout/side-bar/ChannelAddDialog.tsx",
                line: 45,
                severity: "Warning",
                category: "Logic",
                issue: "Missing error handling and user feedback for channel creation failures.",
                suggestion:
                    "```typescript\nconst onSubmit = (data: z.infer<typeof FormSchema>) => {\n    createChannel(data)\n        .unwrap()\n        .then(() => {\n            // toast({\n            //     message: 'Channel created successfully',\n            //     type: 'success',\n            // })\n            form.reset(); // Reset form on success\n        })\n        .catch((error: any) => {\n            // toast({\n            //     message: error?.data?.message || 'Failed to create channel',\n            //     type: 'error',\n            // })\n            console.error('Channel creation failed:', error);\n        })\n}\n```",
            },
            {
                path: "resources/js/store/apis/channelApi.ts",
                line: 12,
                severity: "Warning",
                category: "Logic",
                issue: "The change from 'data.data' to 'data.data?.channel' suggests a breaking API change, but there's no error handling for when 'channel' is undefined or null.",
                suggestion:
                    "```typescript\nqueryFulfilled.then(({ data }) => {\n    const channels = data.data?.channel || [];\n    dispatch(setChannels(channels));\n})\n```",
            },
        ],
    },
};

const Step4Page = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const user = useAuthStore((s) => s.user);

    const [analysisId, setAnalysisId] = useState<string | null>(null);

    const repoId = searchParams.get("repoId") as string;
    const prId = searchParams.get("prId") as string;

    if (!repoId || !prId) {
        redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_3);
    }

    const { data, isLoading, error } = useReviewPullRequestQuery({
        provider: user?.provider || "github", // Default to GitHub if not set
        repoId,
        prId,
    });
    const {
        data: analysisData,
        isLoading: isLoadingAnalysis,
        error: analysisError,
    } = usePullRequestAnalysisQuery({
        analysisId: analysisId || "",
        enabled: !!analysisId,
    });

    const onStepComplete = () => {
        redirect(
            ROUTE_CONSTANTS.ONBOARDING_STEP_5 + `?prId=${prId}&repoId=${repoId}`
        );
    };

    useEffect(() => {
        if (data) {
            setAnalysisId(data.pullRequestAnalysisId);
        }
    }, [data]);

    return (
        <>
            <div className="grid grid-cols-12 gap-4 lg:gap-8">
                {/* Left column */}
                <div className="col-span-4 xl:pr-16">
                    <h2 className="text-4xl font-medium text-[var(--title-50)] mb-4 leading-[45px]">
                        Generate your first AI-powered review
                    </h2>
                    <p className="text-base font-medium text-[var(--subtitle-400)] mb-6">
                        Please wait a moment. Our AI is now deeply analyzing PR
                        Improve database query performance to identify potential
                        bugs, performance bottlenecks, security flaws, and style
                        inconsistencies.
                    </p>
                </div>

                {/* Right column */}
                <div className="col-span-8">
                    <div className="mb-4">
                        <h3 className="text-[var(--title-50)] font-medium mb-4 text-lg">
                            PR Summary
                        </h3>
                        {data && data?.pullRequest && (
                            <>
                                <div className="grid grid-cols-6 py-3 text-[var(--subtitle-400)] text-sm font-medium">
                                    <div className="col-span-2 pl-3">Title</div>
                                    <div className="col-span-1 pl-1">
                                        Author
                                    </div>
                                    <div className="col-span-1 text-center">
                                        Status
                                    </div>
                                    <div className="col-span-1 text-right pr-3">
                                        Created at
                                    </div>
                                    <div className="col-span-1 text-right pr-4">
                                        Updated at
                                    </div>
                                </div>

                                <div className="grid grid-cols-6 py-3 bg-[var(--box-800)] rounded-lg">
                                    <div className="flex items-center col-span-2">
                                        <span className="text-[var(--title-50)] text-base font-medium ml-3">
                                            {data?.pullRequest?.prTitle}
                                        </span>
                                    </div>
                                    <div className="flex items-center col-span-1">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-[var(--subtitle-500)] flex items-center justify-center mr-2 flex-shrink-0">
                                                {data?.pullRequest
                                                    ?.avatarUrl ? (
                                                    <Image
                                                        src={
                                                            data.pullRequest
                                                                .avatarUrl
                                                        }
                                                        alt={
                                                            data.pullRequest
                                                                .prUser || ""
                                                        }
                                                        className="w-full h-full object-cover"
                                                        width={32}
                                                        height={32}
                                                    />
                                                ) : (
                                                    <span className="text-[var(--title-50)] text-sm">
                                                        {data.pullRequest.prUser?.charAt(
                                                            0
                                                        ) || "?"}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[var(--subtitle-500)] text-sm">
                                                {data.pullRequest.prUser ||
                                                    "Unknown"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-span-1 text-center">
                                        
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${data?.pullRequest?.prState === "merged" || data?.pullRequest?.prState === "closed"
                                                ? "bg-red-500 text-white"
                                                : "bg-green-500 text-white"}`}
                                        >
                                            {data?.pullRequest?.prState}
                                        </span>
                                    </div>
                                    <div className="col-span-1 text-right text-sm">
                                        {formatDate(
                                            data?.pullRequest?.createdAt
                                        )}
                                    </div>
                                    <div className="col-span-1 text-right text-sm pr-4">
                                        {formatDate(
                                            data?.pullRequest?.updatedAt
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="bg-dark-900 border border-dashed rounded-xl mt-3">
                            {(isLoading || isLoadingAnalysis) && (
                                <p className="text-[var(--subtitle-400)] p-5">
                                    Loading PR summary...
                                </p>
                            )}
                            {(error || analysisError) && (
                                <p className="text-[var(--subtitle-400)] p-7">
                                    Error loading PR summary. Please try again.
                                </p>
                            )}

                            {(data?.pullRequestAnalysis || analysisData) && (
                                <PrCodeAnalysis
                                    analysisData={
                                        (analysisData as PRAnalysisData) ||
                                        data?.pullRequestAnalysis
                                    }
                                    pullRequest={data?.pullRequest}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer with action button */}
            <ActionFooter
                buttonText="Invite team members"
                isEnabled={!isLoading}
                isLoading={isLoading}
                onClick={onStepComplete}
                onBackClick={() =>
                    redirect(
                        ROUTE_CONSTANTS.ONBOARDING_STEP_3 +
                            "?repoId=" +
                            repoId +
                            "&prId=" +
                            prId
                    )
                }
            />
        </>
    );
};

export default Step4Page;
