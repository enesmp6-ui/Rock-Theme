import React, { useEffect, useRef, useState } from 'react';
import Modal, { RequiredModalProps } from '@/components/elements/Modal';
import { Field, Form, Formik, FormikHelpers, useFormikContext } from 'formik';
import { Actions, useStoreActions, useStoreState } from 'easy-peasy';
import { object, string } from 'yup';
import debounce from 'debounce';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import InputSpinner from '@/components/elements/InputSpinner';
import getServers from '@/api/getServers';
import { Server } from '@/api/server/getServer';
import { ApplicationStore } from '@/state';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import Input from '@/components/elements/Input';
import { ip } from '@/lib/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faCode, faHome, faKey, faServer, faTerminal, faUser } from '@fortawesome/free-solid-svg-icons';

type Props = RequiredModalProps;

interface Values {
    term: string;
}

const ServerResult = styled(Link)`
    ${tw`flex items-center p-4 no-underline transition-colors duration-150`};
    color: #ededed;
    border: 1px solid #262626;
    border-radius: 8px;
    background: #0a0a0a;

    &:hover {
        border-color: #3f3f3f;
        background: #111;
    }

    &:not(:last-of-type) {
        ${tw`mb-2`};
    }
`;

const CommandResult = styled(Link)`
    ${tw`flex items-center p-3 no-underline transition-colors duration-150`};
    color: #a1a1a1;
    border: 1px solid transparent;
    border-radius: 6px;

    &:hover {
        color: #ededed;
        border-color: #262626;
        background: #111;
    }
`;

const SearchWatcher = () => {
    const { values, submitForm } = useFormikContext<Values>();
    useEffect(() => {
        if (values.term.length >= 3) submitForm();
    }, [values.term]);
    return null;
};

export default ({ ...props }: Props) => {
    const ref = useRef<HTMLInputElement>(null);
    const isAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [servers, setServers] = useState<Server[]>([]);
    const commands = [
        { name: 'Dashboard', hint: 'Servers and telemetry', path: '/', icon: faHome },
        { name: 'Account', hint: 'Profile and security', path: '/account', icon: faUser },
        { name: 'API credentials', hint: 'Application access', path: '/account/api', icon: faCode },
        { name: 'SSH keys', hint: 'Secure file access', path: '/account/ssh', icon: faKey },
        { name: 'Public status', hint: 'Infrastructure status', path: '/status', icon: faServer },
    ];
    const { clearAndAddHttpError, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const search = debounce(({ term }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('search');
        getServers({ query: term, type: isAdmin ? 'admin-all' : undefined })
            .then((servers) => setServers(servers.items.filter((_, index) => index < 5)))
            .catch((error) => {
                console.error(error);
                clearAndAddHttpError({ key: 'search', error });
            })
            .then(() => setSubmitting(false))
            .then(() => ref.current?.focus());
    }, 500);

    useEffect(() => {
        if (props.visible) ref.current?.focus();
    }, [props.visible]);

    const InputWithRef = (inputProps: any) => <Input autoFocus {...inputProps} ref={ref} />;

    return (
        <Formik onSubmit={search} validationSchema={object().shape({ term: string() })} initialValues={{ term: '' } as Values}>
            {({ isSubmitting, values }) => (
                <Modal {...props}>
                    <Form>
                        <FormikFieldWrapper name={'term'} label={'Search term'} description={'Search servers, pages, and actions.'}>
                            <SearchWatcher />
                            <InputSpinner visible={isSubmitting}>
                                <Field as={InputWithRef} name={'term'} />
                            </InputSpinner>
                        </FormikFieldWrapper>
                    </Form>
                    <div css={tw`mt-5`}>
                        <p css={tw`text-xs text-neutral-500 mb-2`}>Quick actions</p>
                        {commands
                            .filter((command) => `${command.name} ${command.hint}`.toLowerCase().includes(values.term.toLowerCase()))
                            .map((command) => (
                                <CommandResult key={command.path} to={command.path} onClick={() => props.onDismissed()}>
                                    <FontAwesomeIcon icon={command.icon} css={tw`w-4 mr-3 text-neutral-500`} />
                                    <span css={tw`flex-1 text-sm`}>{command.name}</span>
                                    <small css={tw`text-neutral-500`}>{command.hint}</small>
                                </CommandResult>
                            ))}
                        {isAdmin && (
                            <a href={'/admin'} className={'flex items-center p-3 rounded no-underline text-neutral-400 hover:text-white hover:bg-neutral-900'}>
                                <FontAwesomeIcon icon={faBolt} css={tw`w-4 mr-3 text-neutral-500`} />
                                <span css={tw`flex-1 text-sm`}>Admin panel</span>
                                <small css={tw`text-neutral-500`}>Administration</small>
                            </a>
                        )}
                    </div>
                    {servers.length > 0 && (
                        <div css={tw`mt-6`}>
                            <p css={tw`text-xs text-neutral-500 mb-2`}>
                                <FontAwesomeIcon icon={faTerminal} css={tw`mr-2`} /> Servers
                            </p>
                            {servers.map((server) => (
                                <ServerResult key={server.uuid} to={`/server/${server.id}`} onClick={() => props.onDismissed()}>
                                    <div css={tw`flex-1 mr-4`}>
                                        <p css={tw`text-sm`}>{server.name}</p>
                                        <p css={tw`mt-1 text-xs text-neutral-400`}>
                                            {server.allocations
                                                .filter((alloc) => alloc.isDefault)
                                                .map((allocation) => (
                                                    <span key={allocation.ip + allocation.port.toString()}>
                                                        {allocation.alias || ip(allocation.ip)}:{allocation.port}
                                                    </span>
                                                ))}
                                        </p>
                                    </div>
                                    <div css={tw`flex-none text-right`}>
                                        <span className={'text-xs py-1 px-2 rounded border border-neutral-800 bg-neutral-900 text-neutral-300'}>{server.node}</span>
                                    </div>
                                </ServerResult>
                            ))}
                        </div>
                    )}
                </Modal>
            )}
        </Formik>
    );
};
