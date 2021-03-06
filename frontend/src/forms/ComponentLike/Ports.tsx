import { Box, Button, Collapse, Fade, Grid, Link, Paper, Popper } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { normalizePort } from "forms/normalizer";
import { POPPER_ZINDEX } from "layout/Constants";
import PopupState, { anchorRef, bindPopper, InjectedProps } from "material-ui-popup-state";
import React from "react";
import { Field } from "react-final-form";
import { FieldArray, FieldArrayRenderProps } from "react-final-form-arrays";
import {
  ComponentLikePort,
  PortProtocolGRPC,
  PortProtocolHTTP,
  PortProtocolHTTP2,
  PortProtocolTCP,
  PortProtocolUDP,
} from "types/componentTemplate";
import sc from "utils/stringConstants";
import { AddIcon, DeleteIcon } from "widgets/Icon";
import { IconButtonWithTooltip } from "widgets/IconButtonWithTooltip";
import { PortChart } from "widgets/PortChart";
import { FinalSelectField } from "../Final/select";
import { FinalTextField } from "../Final/textfield";
import { ValidatorContainerPortRequired, ValidatorPort } from "../validator";

interface Props extends FieldArrayRenderProps<ComponentLikePort, any> {}

class RenderPorts extends React.PureComponent<Props> {
  private handlePush() {
    this.props.fields.push({ protocol: PortProtocolHTTP } as any);
  }

  private handleRemove(index: number) {
    this.props.fields.remove(index);
  }

  private handleBlur(close: any, e: any) {
    console.log("handleBlur", close);
    close();
  }

  public render() {
    const { fields } = this.props;
    const name = fields.name;

    return (
      <>
        <Box mb={2}>
          <Grid item xs>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              size="small"
              onClick={this.handlePush.bind(this)}
            >
              Add
            </Button>

            {/* {submitFailed && error && <span>{error}</span>} */}
            {fields.error && typeof fields.error === "string" ? (
              <Box mt={2}>
                <Alert severity="error">{fields.error}</Alert>
              </Box>
            ) : null}
          </Grid>
        </Box>

        {fields.value &&
          fields.value.map((field: ComponentLikePort, index: number) => {
            return (
              <Grid container spacing={2} key={index}>
                <Grid item xs>
                  <Field
                    name={`${name}.${index}.protocol`}
                    component={FinalSelectField}
                    label="Protocol"
                    options={[
                      { value: PortProtocolHTTP, text: PortProtocolHTTP },
                      { value: PortProtocolHTTP2, text: PortProtocolHTTP2 },
                      { value: PortProtocolGRPC, text: PortProtocolGRPC },
                      { value: PortProtocolTCP, text: PortProtocolTCP },
                      { value: PortProtocolUDP, text: PortProtocolUDP },
                    ]}
                  />
                </Grid>
                <PopupState variant="popover" popupId={`container-port-${index}`} disableAutoFocus>
                  {(popupState: InjectedProps) => {
                    return (
                      <>
                        <Grid
                          item
                          xs
                          ref={(c: any) => {
                            anchorRef(popupState)(c);
                          }}
                        >
                          <Field<number | undefined>
                            onFocus={popupState.open}
                            handleBlur={popupState.close}
                            component={FinalTextField}
                            name={`${name}.${index}.containerPort`}
                            label="Container port"
                            placeholder="1~65535,not 443"
                            parse={normalizePort}
                            validate={ValidatorContainerPortRequired}
                          />
                        </Grid>
                        <Popper
                          {...bindPopper(popupState)}
                          transition
                          placement="top"
                          style={{ zIndex: POPPER_ZINDEX }}
                        >
                          {({ TransitionProps }) => (
                            <Fade {...TransitionProps} timeout={350}>
                              <Paper elevation={2} variant="outlined" square>
                                <Box p={2}>
                                  <PortChart highlightContainerPort />
                                </Box>
                              </Paper>
                            </Fade>
                          )}
                        </Popper>
                      </>
                    );
                  }}
                </PopupState>
                <PopupState variant="popover" popupId={`service-port-${index}`} disableAutoFocus>
                  {(popupState: InjectedProps) => {
                    return (
                      <>
                        <Grid
                          item
                          xs
                          ref={(c: any) => {
                            anchorRef(popupState)(c);
                          }}
                        >
                          <Field
                            onFocus={popupState.open}
                            handleBlur={popupState.close}
                            component={FinalTextField}
                            name={`${name}.${index}.servicePort`}
                            label="Service Port"
                            placeholder="Default to equal publish port"
                            parse={normalizePort}
                            validate={ValidatorPort}
                          />
                        </Grid>
                        <Popper
                          {...bindPopper(popupState)}
                          transition
                          placement="top"
                          style={{ zIndex: POPPER_ZINDEX }}
                        >
                          {({ TransitionProps }) => (
                            <Fade {...TransitionProps} timeout={350}>
                              <Paper elevation={2} variant="outlined" square>
                                <Box p={2}>
                                  <PortChart highlightServicePort />
                                </Box>
                              </Paper>
                            </Fade>
                          )}
                        </Popper>
                      </>
                    );
                  }}
                </PopupState>

                <Grid item xs={1}>
                  <IconButtonWithTooltip
                    tooltipPlacement="top"
                    tooltipTitle="Delete"
                    aria-label="delete"
                    onClick={this.handleRemove.bind(this, index)}
                  >
                    <DeleteIcon />
                  </IconButtonWithTooltip>
                </Grid>
              </Grid>
            );
          })}
      </>
    );
  }
}

const ValidatorPorts = (values: ComponentLikePort[], _allValues?: any, _props?: any, _name?: any) => {
  if (!values) return undefined;
  const protocolServicePorts = new Set<string>();

  for (let i = 0; i < values.length; i++) {
    const port = values[i]!;
    const servicePort = port.servicePort || port.containerPort;

    if (servicePort) {
      const protocol = port.protocol;
      const protocolServicePort = protocol + "-" + servicePort;

      if (!protocolServicePorts.has(protocolServicePort)) {
        protocolServicePorts.add(protocolServicePort);
      } else if (protocolServicePort !== "") {
        return "Listening port on a protocol should be unique.  " + protocol + " - " + servicePort;
      }
    }
  }
};

export const Ports = () => {
  return <FieldArray name="ports" component={RenderPorts} validate={ValidatorPorts} />;
};

export const IngressHint = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Link style={{ cursor: "pointer" }} onClick={() => setOpen(!open)}>
        {sc.PORT_ROUTE_QUESTION}
      </Link>
      <Box pt={1}>
        <Collapse in={open}>{sc.PORT_ROUTE_ANSWER}</Collapse>
      </Box>
    </>
  );
};
