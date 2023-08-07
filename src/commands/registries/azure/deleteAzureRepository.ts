/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DialogResponses, IActionContext, contextValueExperience } from '@microsoft/vscode-azext-utils';
import { ProgressLocation, l10n, window } from 'vscode';
import { ext } from '../../../extensionVariables';
import { AzureRegistryDataProvider, AzureRepository } from '../../../tree/registries/Azure/AzureRegistryDataProvider';
import { UnifiedRegistryItem } from '../../../tree/registries/UnifiedRegistryTreeDataProvider';

export async function deleteAzureRepository(context: IActionContext, node?: UnifiedRegistryItem<AzureRepository>): Promise<void> {
    if (!node) {
        node = await contextValueExperience(context, ext.registriesTree, { include: 'azureContainerRepository' });
    }

    const confirmDelete = l10n.t('Are you sure you want to delete repository "{0}" and its associated images?', node.wrappedItem.label);
    // no need to check result - cancel will throw a UserCancelledError
    await context.ui.showWarningMessage(confirmDelete, { modal: true }, DialogResponses.deleteResponse);

    const deleting = l10n.t('Deleting repository "{0}"...', node.wrappedItem.label);
    await window.withProgress({ location: ProgressLocation.Notification, title: deleting }, async () => {
        const azureDataProvider = node.provider as unknown as AzureRegistryDataProvider;
        await azureDataProvider.deleteRepository(node.wrappedItem);
    });

    ext.registriesTree.refresh();

    const deleteSucceeded = l10n.t('Successfully deleted repository "{0}".', node.wrappedItem.label);
    // don't wait
    /* eslint-disable-next-line @typescript-eslint/no-floating-promises */
    window.showInformationMessage(deleteSucceeded);
}
