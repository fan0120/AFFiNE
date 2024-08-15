import { notify } from '@affine/component';
import { getAffineCloudBaseUrl } from '@affine/core/modules/cloud/services/fetch';
import { I18n } from '@affine/i18n';
import { LinkIcon } from '@blocksuite/icons/lit';
import { type FrameworkProvider, WorkspaceService } from '@toeverything/infra';

export function createEdgelessElementToolbarWidgetConfig(
  framework: FrameworkProvider
) {
  return {
    configureMoreMenu: groups => {
      const clipboardGroup = groups.find(group => group.type === 'clipboard');

      if (clipboardGroup) {
        const copyIndex = clipboardGroup.items.findIndex(
          item => item.type === 'copy'
        );
        clipboardGroup.items.splice(
          copyIndex + 1,
          0,
          createCopyLinkToBlockMenuItem(framework)
        );
      }

      return groups;
    },
  };
}

function createCopyLinkToBlockMenuItem(
  framework: FrameworkProvider,
  item = {
    icon: LinkIcon({ width: '20', height: '20' }),
    label: 'Copy link to block',
    type: 'copy-link-to-block',
    showWhile: ctx => ctx.isSingle(),
  }
) {
  return {
    ...item,
    action: ctx => {
      const baseUrl = getAffineCloudBaseUrl();
      if (!baseUrl) return;

      let str;

      // mode = page | edgeless
      // `?mode={mode}&blockId={bid}`
      // `?mode={mode}&elementId={eid}`
      try {
        const workspace = framework.get(WorkspaceService).workspace;
        const workspaceId = workspace.id;
        const pageId = ctx.doc.id;
        const id = ctx.firstElement.id;
        const url = new URL(`${baseUrl}/workspace/${workspaceId}/${pageId}`);
        const searchParams = url.searchParams;

        searchParams.append('mode', 'edgeless');

        if (ctx.isElement()) {
          searchParams.append('elementId', id);
        } else {
          searchParams.append('blockId', id);
        }

        str = url.toString();
      } catch (e) {
        console.error(e);
      }

      if (!str) return;

      navigator.clipboard
        .writeText(str)
        .then(() => {
          notify.success({
            title: I18n['Copied link to clipboard'](),
          });
        })
        .catch(console.error);
    },
  };
}
