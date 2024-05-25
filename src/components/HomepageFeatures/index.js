import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'GraphQL Ready',
    Svg: require('@site/static/img/undraw_graphql.svg').default,
    description: (
      <>
        开箱即用的GraphQL 多协议 多范式
      </>
    ),
  },
  {
    title: 'Full Stack Reactive',
    Svg: require('@site/static/img/undraw_reactor.svg').default,
    description: (
      <>
        全栈响应式 无阻塞 高性能
      </>
    ),
  },
  {
    title: 'Container Architecture',
    Svg: require('@site/static/img/undraw_containers.svg').default,
    description: (
      <>
        Monolithic or Microservice 随心所欲
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
