import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FoblexComponent } from "./foblex/foblex.component";

@Component({
  selector: 'app-root',
  imports: [FoblexComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent {
  title = 'foblex-flow';
}
