import { Component, AfterViewInit, ViewChild, ElementRef, Input, HostBinding, Output, EventEmitter, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import * as d3 from 'd3';

import { StrangenessEnhancementPlotEntry, KAON_COLOR, LAMBDA_COLOR, ANTILAMBDA_COLOR } from '../strangeness-large-scale-analysis.component';
import { ParticleType } from '../../shared/services/api.service';

@Component({
  selector: 'app-strangeness-enhancement-plot',
  templateUrl: './strangeness-enhancement-plot.component.html',
  styleUrls: ['./strangeness-enhancement-plot.component.scss']
})
export class StrangenessEnhancementPlotComponent implements AfterViewInit, OnDestroy {
  @Input()
  @HostBinding("style.--kaon-color")
  public kaonColor: string = KAON_COLOR;

  @Input()
  @HostBinding("style.--lambda-color")
  public lambdaColor: string = LAMBDA_COLOR;

  @Input()
  @HostBinding("style.--antilambda-color")
  public antilambdaColor: string = ANTILAMBDA_COLOR;

  public readonly SVG = {
    W: 600,
    H: 200
  }

  public readonly MARGIN = {
    TOP: 5,
    RIGHT: 10,
    BOTTOM: 20,
    BOTTOM_XLABEL: 10,
    BOTTOM_TEXT: 3,
    LEFT: 25,
    LEFT_YLABEL: 10
  };

  public readonly CONTENT_AREA = {
    X: this.MARGIN.LEFT + this.MARGIN.LEFT_YLABEL,
    Y: this.MARGIN.TOP,
    W: this.SVG.W - this.MARGIN.LEFT - this.MARGIN.LEFT_YLABEL - this.MARGIN.RIGHT,
    H: this.SVG.H - this.MARGIN.TOP - this.MARGIN.BOTTOM - this.MARGIN.BOTTOM_XLABEL
  };

  public readonly ANIMATION_DURATION: number = 500;

  @ViewChild('svg')
  private svgRef!: ElementRef;

  private get svg(): SVGElement {
    return this.svgRef.nativeElement;
  }

  @ViewChild('xAxis')
  private xAxisRef!: ElementRef;

  private get xAxis(): SVGGElement {
    return this.xAxisRef.nativeElement;
  }

  private get xAxisSelector(): d3.Selection<SVGGElement, unknown, null, undefined> {
    return d3.select(this.xAxis);
  }

  @ViewChild('yAxis')
  private yAxisRef!: ElementRef;

  private get yAxis(): SVGGElement {
    return this.yAxisRef.nativeElement;
  }

  private get yAxisSelector(): d3.Selection<SVGGElement, unknown, null, undefined> {
    return d3.select(this.yAxis);
  }

  @ViewChild('dots')
  private dotsRef!: ElementRef;

  private get dots(): SVGGElement {
    return this.dotsRef.nativeElement;
  }

  private get dotsSelector(): d3.Selection<SVGGElement, unknown, null, undefined> {
    return d3.select(this.dots);
  }

  @ViewChild('line')
  private lineRef!: ElementRef;

  private get line(): SVGGElement {
    return this.lineRef.nativeElement;
  }

  private get lineSelector(): d3.Selection<SVGGElement, unknown, null, undefined> {
    return d3.select(this.line);
  }

  @Input()
  get xDomain(): [number, number] { return this._xDomain.getValue(); }
  set xDomain(domain: [number, number]) {
    this._xDomain.next(domain);
  }
  private _xDomain: BehaviorSubject<[number, number]> = new BehaviorSubject([0, 1]);
  private xDomainSubscription: Subscription = new Subscription;

  @Input()
  get yDomain(): [number, number] { return this._yDomain.getValue(); }
  set yDomain(domain: [number, number]) {
    this._yDomain.next(domain);
  }
  private _yDomain: BehaviorSubject<[number, number]> = new BehaviorSubject([0, 1]);
  private yDomainSubscription: Subscription = new Subscription;

  @Input()
  get data(): Array<StrangenessEnhancementPlotEntry> { return this._data.getValue(); }
  set data(data: Array<StrangenessEnhancementPlotEntry>) {
    const yMax = d3.max(data, (d) => { return d.enhancement; }) ?? 0;

    if (yMax !== 0) {
      this.yDomain = [0, yMax*1.1]; //Add 10% margin
    } else {
      this.yDomain = [0, 2.6];
    }

    this._data.next(data);
  }
  private _data: BehaviorSubject<Array<StrangenessEnhancementPlotEntry>> = new BehaviorSubject<Array<StrangenessEnhancementPlotEntry>>([]);
  private dataSubscription: Subscription = new Subscription;

  protected xScale: d3.ScaleLinear<number,number> = d3.scaleLinear<number>();
  protected yScale: d3.ScaleLinear<number,number> = d3.scaleLinear<number>();

  constructor() { }

  ngAfterViewInit(): void {
    this.xScale.range([0, this.CONTENT_AREA.W]);
    this.yScale.range([this.CONTENT_AREA.H, 0]);

    this.xDomainSubscription = this._xDomain.subscribe((domain) => {
      this.xScale.domain(domain);

      this.updateXDomain();
    });

    this.yDomainSubscription = this._yDomain.subscribe((domain) => {
      this.yScale.domain(domain);

      this.updateYDomain();
    });

    this.dataSubscription = this._data.subscribe((data) => {
      this.updateDots();
    });
  }

  ngOnDestroy(): void {
    this.xDomainSubscription.unsubscribe();
    this.yDomainSubscription.unsubscribe();
    this.dataSubscription.unsubscribe();
  }

  private updateXDomain(): void {
    if (this.xAxisRef) {
      this.xAxisSelector.transition().duration(this.ANIMATION_DURATION).call(d3.axisBottom(this.xScale));
    }
  }

  private updateYDomain(): void {
    if (this.yAxisRef) {
      this.yAxisSelector.transition().duration(this.ANIMATION_DURATION).call(d3.axisLeft(this.yScale));

      this.lineSelector
      .attr('x1', this.xScale(this.xDomain[0]))
      .attr('y1', this.yScale(1) + 0.5)
      .attr('x2', this.xScale(this.xDomain[1]))
      .attr('y2', this.yScale(1) + 0.5);
    }
  }

  private updateDots(): void {
    const dotsSelection = this.dotsSelector.selectAll('circle').data(this.data);

    dotsSelection
      .join(
        (enter) => {
          return enter
            .append('circle')
            .attr('class', (d) => {
              switch(d.particle) {
                case ParticleType.KAON:
                  return 'kaon';
                case ParticleType.LAMBDA:
                  return 'lambda';
                case ParticleType.ANTI_LAMBDA:
                  return 'antilambda';
              }
              return '';
            })
            .attr('cx', (d) => this.xScale(d.nParticipants))
            .attr('cy', (d) => this.yScale(0))
            .attr('r', 0);
        },
        (update) => {
          return update;
        },
        (exit) => {
          return exit.remove();
        }
      )
      .transition().duration(this.ANIMATION_DURATION)
      .attr('cx', (d) => this.xScale(d.nParticipants))
      .attr('cy', (d) => this.yScale(d.enhancement))
      .attr('r', (d) => d.enhancement > 0 ? 4 : 0);
  }

}
