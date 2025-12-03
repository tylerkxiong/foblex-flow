import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, viewChild, HostListener, ElementRef } from '@angular/core';
import {
  FCanvasComponent,
  FCreateNodeEvent,
  FExternalItemDirective,
  FFlowModule,
  EFResizeHandleType,
  FFlowComponent,
  FCreateConnectionEvent,
  FMarkerBase,
  EFMarkerType
} from '@foblex/flow';
import { generateGuid } from '@foblex/utils';

// 1. Define Interfaces
interface DiagramNode {
  id: string;
  text: string;
  type: string;
  position: { x: number; y: number };
  size: any;
  rotate: number;
}

interface DiagramConnection {
  id: string;
  source: string;
  target: string;
}

interface FlowData {
  nodes: DiagramNode[];
  connections: DiagramConnection[];
}

@Component({
  selector: 'app-foblex',
  standalone: true,
  imports: [CommonModule, FFlowModule],
  templateUrl: './foblex.component.html',
  styleUrl: './foblex.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FoblexComponent {

  // 2. Signals for Nodes AND Connections
  protected nodes = signal<DiagramNode[]>([]);
  protected connections = signal<DiagramConnection[]>([]);

  protected fCanvas = viewChild(FCanvasComponent);
  protected flowComponent = viewChild(FFlowComponent);
  
  // Reference to the hidden file input
  protected fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInputRef');

  protected readonly eResizeHandleType = EFResizeHandleType;
  
  // Define Markers for connections (arrowheads)
  protected readonly eMarkerType = EFMarkerType;

  constructor() {
    // Initialize with some dummy data
    this.nodes.set([
      { id: '1', text: 'Start', type: 'circle', position: { x: 50, y: 50 }, size: { width: 100, height: 100 }, rotate: 0 },
      { id: '2', text: 'Process', type: 'rect', position: { x: 300, y: 50 }, size: { width: 120, height: 60 }, rotate: 0 }
    ]);
  }

  protected onLoaded(): void {
    this.fCanvas()?.resetScaleAndCenter(false);
  }

  // --- NODE HANDLING ---
  protected onCreateNode(event: FCreateNodeEvent): void {
    const data = event.data || { text: 'New Node', type: 'rect' };
    this.nodes.update((nodes) => [
      ...nodes,
      {
        id: generateGuid(),
        text: data.text,
        type: data.type,
        position: event.rect,
        size: event.rect,
        rotate: data.type == "diamond" ? 45 : 0
      },
    ]);
  }

  // --- CONNECTION HANDLING ---
 protected onCreateConnection(event: FCreateConnectionEvent): void {
    // 1. We check if they exist here
    if (!event.fOutputId || !event.fInputId) {
        return;
    }

    this.connections.update(conns => [
      ...conns,
      {
        id: generateGuid(),
        source: event.fOutputId,
        target: event.fInputId as string,
      }
    ]);
  }

  // --- EXPORT TO JSON ---
  protected exportFlow(): void {
    const data: FlowData = {
      nodes: this.nodes(),
      connections: this.connections()
    };

    const jsonString = JSON.stringify(data, null, 2); // Pretty print
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);

    // Create temporary link to trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `flow-diagram-${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // --- IMPORT FROM JSON ---
  protected triggerImport(): void {
    // Click the hidden input
    this.fileInput()?.nativeElement.click();
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const data: FlowData = JSON.parse(json);

        // Basic validation
        if (Array.isArray(data.nodes) && Array.isArray(data.connections)) {
          this.nodes.set(data.nodes);
          this.connections.set(data.connections);
          
          // Re-center canvas after short delay to let DOM render
          setTimeout(() => {
            this.fCanvas()?.resetScaleAndCenter(false);
          }, 50);
        } else {
          alert('Invalid JSON file format');
        }
      } catch (err) {
        console.error('Error parsing JSON', err);
        alert('Error parsing JSON file');
      }
    };

    reader.readAsText(file);
    // Reset input so same file can be selected again if needed
    input.value = '';
  }
}