import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

export type stepperType = "H" | "V";

interface dimension {
  index: number;
  cx: number;
  cy: number;
  current: boolean;
  text: string;
}

@Component({
  selector: "stepper-sys",
  templateUrl: "stepper.component.html",
  styleUrls: ["stepper.component.scss"],
})
export class StepperSys implements OnInit {
  @Input()
  testList = [
    "Infos personnelles",
    "Infos entreprise",
    "Certifications & labels",
  ];

  @Input()
  rayon: number = 15;

  @Input()
  margin: number = 10;

  @Input()
  fill: string = "#b3b3b3";

  @Input()
  type: stepperType = "V";

  nodes: dimension[] = [];

  @Input()
  currentIndex = 0;

  @Output()
  nodeId = new EventEmitter<number>();

  constructor() {}

  ngOnInit() {
    this.nodes =
      this.type === "H" ? this.horizantaleStepper() : this.verticalStepper();
  }
  verticalStepper() {
    const cy = 0;
    const iterate = this.testList.map((text, index) => {
      return {
        index: index,
        cx: index * this.rayon * this.margin,
        cy: this.margin,
        current: index == 0 ? true : false,
        text: text,
      };
    });

    return iterate;
  }
  horizantaleStepper() {
    const cx = 0;
    const iterate = this.testList.map((text, index) => {
      return {
        index: index,
        cx: this.margin,
        cy: index * this.rayon * this.margin,
        current: index == 0 ? true : false,
        text: text,
      };
    });

    return iterate;
  }
  notFirstOrLast(id: number) {
    if (id === 0 || id === this.testList.length - 1) return true;
    else return false;
  }

  nodeChangeStep(node: dimension) {
    const previuosNode = this.nodes.filter((node) => node.current === true);
    previuosNode[0].current = false;
    [...this.nodes, previuosNode[0]];
    node.current = true;
    this.nodeId.emit((this.currentIndex = node.index));
    return [...this.nodes, node];
  }
}
